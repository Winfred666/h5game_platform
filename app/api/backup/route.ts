import { NextResponse } from "next/server";
import { createOrReuseBackupZip } from "@/lib/services/adminBackup";
import { createReadStream } from "fs";
import { authProtectedModule } from "@/lib/services/builder";

export async function GET() {
  try {
    
    await authProtectedModule(true); // require admin
    // smartly create or reuse existing backup file
    const {backupPath, fileName, size} = await createOrReuseBackupZip();

    // Create file stream
    const fileStream = createReadStream(backupPath);

    // Create a readable stream for NextJS
    const readableStream = new ReadableStream<Uint8Array>({
      start(controller) {
        fileStream.on('data', (chunk: string | Buffer) => {
          if (typeof chunk === 'string') {
            controller.enqueue(new TextEncoder().encode(chunk));
          } else {
            controller.enqueue(chunk);
          }
        });
        
        fileStream.on('end', () => {
          controller.close();
        });
        
        fileStream.on('error', (error) => {
          controller.error(error);
        });
      },
      cancel() {
        fileStream.destroy();
      }
    });

    // Return response with file stream
    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": size.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ Backup download error:", error);
    return NextResponse.json(
      { error: "Backup generation failed" }, 
      { status: 500 }
    );
  }
}