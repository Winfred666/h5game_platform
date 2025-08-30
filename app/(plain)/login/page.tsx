"use client";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { useLoading } from "@/components/LoadingProvider";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { LoginFormInputSchema, LoginFormInputType } from "@/lib/types/zforms";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callback?: string }>;
}) {
  const { callback } = use(searchParams);
  // console.log("callback: ", callback);
  const router = useRouter();
  const { startLoading } = useLoading();

  const loginForm = useForm<LoginFormInputType>({
    resolver: zodResolver(LoginFormInputSchema),
    mode: "onBlur",
    defaultValues: {
      qq: "",
      password: "",
    },
  });

  // need a whole function to be server side.

  const onSubmit: SubmitHandler<LoginFormInputType> = async (data) => {
    // Handle login logic here
    // console.log("Login data submitted:", data);
    await startLoading(async () => {
      const res = await signIn("credentials", {
        redirect: false, // if redirect, will manage router automatically
        ...data,
      });
      if (!res.ok || res.error) {
        console.error("Login failed:", res.error);
        throw new Error("登录失败，请检查QQ号和密码");
      }
      return { success: true, data: res.status };
    }, {
      loadingMsg: "正在登录...",
      successMsg: "登录成功！",
    });
    // Redirect after successful login
    router.push(callback || ALL_NAVPATH.home.href());
  };

  return (
    <Form {...loginForm}>
      <form
        onSubmit={loginForm.handleSubmit(onSubmit)}
        className="self-center w-xs lg:w-md px-8 py-4 
        relative top-[25vh] rounded-md bg-card border
          flex flex-col gap-4 lg:scale-110"
      >
        <InputWithLabel<LoginFormInputType>
          fieldTitle="QQ号"
          nameInSchema="qq"
          placeholder="请输入您的QQ号"
        />
        <InputWithLabel<LoginFormInputType>
          fieldTitle="密码"
          nameInSchema="password"
          type="password"
          placeholder="请输入强密码，初始密码从社团群中获取"
        />
        <Button type="submit" className="w-full mt-4">
          登录
        </Button>
      </form>
    </Form>
  );
}
