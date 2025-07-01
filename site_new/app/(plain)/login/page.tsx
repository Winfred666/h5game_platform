"use client";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { userLoginAction } from "@/lib/actions/authUser";
import { LoginFormInputSchema, LoginFormInputType } from "@/lib/types/zforms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { use } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callback?: string }>;
}) {
  const { callback } = use(searchParams);
  const router = useRouter();

  const loginForm = useForm<LoginFormInputType>({
    resolver: zodResolver(LoginFormInputSchema),
    mode: "onBlur",
    defaultValues: {
      qq: "",
      password: "",
    }
  });

  // need a whole function to be server side.

  const onSubmit: SubmitHandler<LoginFormInputType> = async (data) => {
    // Handle login logic here
    try {
      console.log("Login data submitted:", data);
      const formData = new FormData();
      formData.append("qq", data.qq);
      formData.append("password", data.password);
      await userLoginAction("credentials", formData);
      // Redirect after successful login
      // router.push(callback || "/");
    } catch (e) {
      console.error("Login failed:", e);
      toast.error("登录失败，请检查您的QQ号和密码");
    }
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
