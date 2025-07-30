"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// Local Components
import { SearchHeader } from "../components/SearchHeader";
import { AddUserDialog } from "../components/AddUserDialog";
import { EditUserDialog, UserUpdatePayload } from "../components/EditUserDialog";
import { DeleteUserDialog } from "../components/DeleteUserDialog";

// UI Components
import { Button } from "@/components/ui/button";
import { AdminUserListItem } from "@/components/UserListItem";

// Types and Hooks
import { IUserAdmin } from "@/lib/types/iuser";

export default function UsersTab({users}: { users: IUserAdmin[] }) {

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUserAdmin | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUserAdmin | null>(null);

  // Derived State
  const filteredUsers = users?.filter(
    (user: IUserAdmin) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.qq.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  // Handler Functions
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleOpenEditDialog = (user: IUserAdmin) => {
    setUserToEdit(user);
  };

  const handleCloseEditDialog = () => {
    setUserToEdit(null);
  };

  const handleOpenDeleteDialog = (user: IUserAdmin) => {
    setUserToDelete(user);
  };

  const handleCloseDeleteDialog = () => {
    setUserToDelete(null);
  };

  // Business Logic Handlers
  const handleAddUsers = async (userData: any) => {
    try {
      // TODO: Replace with actual addUsers function
      // await addUsers(userData);
      console.log("Adding users:", userData);
      toast.success("用户添加成功");
      setIsAddDialogOpen(false);
      // Reset input state if needed
    } catch (error) {
      console.error("Failed to add users:", error);
      toast.error("用户添加失败");
    }
  };

  const handleEditUser = async (userData: UserUpdatePayload) => {
    if (!userToEdit) return;

    try {
      // TODO: Replace with actual changeUser function
      // await changeUser(selectedUser.id, userData);
      console.log("Editing user:", userToEdit.id, userData);
      toast.success("用户信息更新成功");
      handleCloseEditDialog();
    } catch (error) {
      console.error("Failed to edit user:", error);
      toast.error("用户信息更新失败");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // TODO: Replace with actual deleteUser function
      // await deleteUser(selectedUser.id);
      console.log("Deleting user:", userToDelete.id);
      toast.success("用户删除成功");
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("用户删除失败");
    }
  };

  return (
    <div className="space-y-6">
      <SearchHeader
        title="用户列表"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or QQ..."
      >
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Users
        </Button>
      </SearchHeader>

      {/* Just list of AdminUserItem */}
      <div>
        {filteredUsers.length > 0 ? 
          filteredUsers.map(user=> (
            <AdminUserListItem key={user.id} user={user} onEdit={setUserToEdit} onDelete={setUserToDelete} />
          ))
        : (
          <div className="text-muted-foreground">没有找到用户</div>
        )}
      </div>
      {/* Dialogs are now clean, single-line components */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddUsers}
      />

      <EditUserDialog
        user={userToEdit}
        onClose={() => setUserToEdit(null)}
        onSave={handleEditUser}
      />

      <DeleteUserDialog
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}