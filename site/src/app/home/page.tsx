import ImageCarousel from '@/components/ImageCarousel';

export default function Home() {
  const images = [
    '/images/1.png',
    '/images/2.png',
    '/images/3.png',
    '/images/4.png',
  ];
  //注:Next.js 的 public 文件夹中的文件会被直接暴露在根路径下。
  //例如，public/images/1.png 可以通过 /images/1.png 访问。

  return (
    <div className="container mx-auto p-4">
      <ImageCarousel images={images} interval={5000} />
    </div>
  );
}