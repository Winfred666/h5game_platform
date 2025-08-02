"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

// Local Components
import { SearchHeader } from "../components/SearchHeader";
import { AddUserDialog } from "../components/AddUserDialog";
import { EditUserDialog } from "../components/EditUserDialog";
import { DeleteObjDialog } from "../components/DeleteObjDialog";

// UI Components
import { Button } from "@/components/ui/button";
import { UserListAdmin } from "@/components/UserListItem";

// Types and Hooks
import { IUserAdmin } from "@/lib/types/iuser";
import {
  addUsersAction,
  deleteUserAction,
  editUserAction,
} from "@/lib/querys&actions/postAdminCmd";
import SetDefaultPasswordButton from "../components/SetDefaultPassword";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";

export default function UsersTab({ users }: { users: IUserAdmin[] }) {
  // State management
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUserAdmin | undefined>();
  const [userToDelete, setUserToDelete] = useState<IUserAdmin | undefined>();

  // Derived State
  const filteredUsers =
    users?.filter(
      (user: IUserAdmin) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.qq.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  // Handler Functions
  const handleCloseEditDialog = () => setUserToEdit(undefined);
  const handleCloseDeleteDialog = () => setUserToDelete(undefined);
  const handleCloseAddDialog = () => setIsAddDialogOpen(false);

  // Business Logic Handlers (just server actions)

  return (
    <div className="space-y-6">
      <SearchHeader
        title="用户列表"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name or QQ..."
      >
        <Button onClick={() => setIsAddDialogOpen(true)}
          className="mr-20">
          <Plus className="h-4 w-4 mr-2" />
          添加用户
        </Button>
        <SetDefaultPasswordButton />
      </SearchHeader>

      
      {/* Just list of AdminUserItem */}
      <div>
        <UserListAdmin
          users={filteredUsers}
          onEdit={setUserToEdit}
          onDelete={setUserToDelete}
          onView={(user)=> router.push(ALL_NAVPATH.profile.href(user.id))}
        />
      </div>
      {/* Dialogs are now clean, single-line components */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onAddAction={addUsersAction}
      />

      <EditUserDialog
        user={userToEdit}
        onClose={handleCloseEditDialog}
        onSaveAction={editUserAction}
      />

      <DeleteObjDialog
        obj={userToDelete}
        onClose={handleCloseDeleteDialog}
        onDeleteAction={(user) => deleteUserAction(user.id)}
        thing="用户"
      />
    </div>
  );
}
