"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserUpdateFormInputSchema,
  UserUpdateFormInputType,
} from "@/lib/types/zformClient";
import { IUser } from "@/lib/types/iuser";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoading } from "@/components/LoadingProvider";
import { useRouter } from "next/navigation";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel";
import SingleImageForm from "@/components/inputs/SingleImageInputWithLabel";
import { PlusCircle, Trash2 } from "lucide-react";
import { objectToFormData } from "@/lib/utils";
import { selfUpdateUserAction } from "@/lib/querys&actions/postUser";
import { useSession } from "next-auth/react";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { useState } from "react";

export default function UserUpdateForm({
  currentUser,
}: {
  currentUser: IUser;
}) {
  const router = useRouter();
  const { startLoading } = useLoading();
  const { update } = useSession();

  const [disabled, setDisabled] = useState(false);

  const form = useForm<UserUpdateFormInputType>({
    mode: "onBlur",
    resolver: zodResolver(UserUpdateFormInputSchema),
    defaultValues: {
      name: currentUser.name,
      password: "",
      introduction: currentUser.introduction,
      avatar: [], // Use array for SingleImageInput
      contacts: currentUser.contacts || [],
    },
  });

  // extract the field array (deeper) and exposed to components
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const onSubmit = async (values: UserUpdateFormInputType) => {
    // console.log(values);
    const curUserId = await startLoading(
      () => selfUpdateUserAction(objectToFormData(values)),
      {
        loadingMsg: "正在更新个人信息...",
        successMsg: "个人信息更新成功！即将跳转到个人主页。",
      }
    );
    // 6. update session data and redirect
    setDisabled(true);
    if (currentUser.name !== values.name)
      await update({ name: values.name });
    setTimeout(() => router.replace(ALL_NAVPATH.profile.href(curUserId)), 1000);
  };

  // WARNING: this <Form> is a provider, every field can use the form context.
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>更新个人信息</CardTitle>
          </CardHeader>
          <CardContent className=" flex flex-col gap-6">
            {/* Profile Picture Section */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) =>
                SingleImageForm(field, currentUser.avatar, "avatar")
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
              <InputWithLabel<UserUpdateFormInputType>
                fieldTitle="昵称"
                nameInSchema="name"
                placeholder="输入您的新昵称"
              />
              <InputWithLabel<UserUpdateFormInputType>
                fieldTitle="设置新密码（请一定牢记）"
                nameInSchema="password"
                type="password"
                placeholder="请输入新密码，不设置可留空"
              />
            </div>

            <TextAreaWithLabel<UserUpdateFormInputType>
              nameInSchema="introduction"
              fieldTitle="自我介绍"
              placeholder="介绍一下自己..."
              className="min-h-[120px]"
            />

            {/* Contacts Section */}
            <div className="flex flex-col gap-2">
              <FormLabel htmlFor="contacts">联系方式</FormLabel>
              <div className="flex flex-col gap-2">
                {contactFields.map((field, index) => (
                  <div key={field.id} className="flex items-baseline gap-4">
                    <InputWithLabel<UserUpdateFormInputType>
                      nameInSchema={`contacts.${index}.way`}
                      className=" flex-grow"
                      placeholder="例如：QQ"
                    />
                    <InputWithLabel<UserUpdateFormInputType>
                      nameInSchema={`contacts.${index}.content`}
                      className=" flex-grow"
                      placeholder="例如：QQ号"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {contactFields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    没有公开联系方式。
                  </p>
                )}
              </div>
              <Button
                className="w-fit"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendContact({ way: "", content: "" })}
              >
                <PlusCircle className="h-4 w-4" />
                添加联系方式
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={disabled}>更新信息</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
