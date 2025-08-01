import { useLoading } from "@/components/LoadingProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setDefaultPasswordAction } from "@/lib/querys&actions/postAdminCmd";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

export default function SetDefaultPasswordButton() {
  const [password, setPassword] = useState("");
  const { startLoading } = useLoading();

  const handleSetDefaultPassword = async () => {
    await startLoading(async () => setDefaultPasswordAction(password), {
      loadingMsg: "正在设置默认密码...",
      successMsg: "默认密码已设置成功！",
    });
    setPassword(""); // Clear the input after setting
  };

  // This component is used to set a default password for new users.
  return (
    <div className=" flex gap-2 items-center">
      <Label>修改新成员默认密码：</Label>
      <Input
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="新的默认密码，需告知新成员"
      />
      <Button variant="outline" onClick={handleSetDefaultPassword}>
        设置
      </Button>
    </div>
  );
}
