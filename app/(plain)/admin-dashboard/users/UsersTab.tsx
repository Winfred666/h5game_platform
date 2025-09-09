"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SearchHeader } from "../components/SearchHeader";
import { AddUserDialog } from "../components/AddUserDialog";
import { EditUserDialog } from "../components/EditUserDialog";
import { DeleteObjDialog } from "../components/DeleteObjDialog";
import { Button } from "@/components/ui/button";
import { UserListAdmin } from "@/components/UserListItem";
import { PaginationWithLinks } from "@/components/ui/pagination-with-link"; // <— added
import { IUserAdmin } from "@/lib/types/iuser";
import {
  addUsersAction,
  deleteUserAction,
  editUserAction,
} from "@/lib/querys&actions/postAdminCmd";
import SetDefaultPasswordButton from "../components/SetDefaultPassword";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import useSearchOptionsDebounce from "@/lib/hooks/useSearchOptions";

export default function UsersTab({
  users,
  currentPage,
  pageSize,
  totalCount,
}: {
  users: IUserAdmin[];
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
}) {
  const router = useRouter();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<IUserAdmin | undefined>();
  const [userToDelete, setUserToDelete] = useState<IUserAdmin | undefined>();

  const { searchOptions, searchTerm, setSearchTerm, isLoading } =
        useSearchOptionsDebounce<IUserAdmin>("admin_user");
  
  const filteredUsers = (searchTerm.trim() === "" || isLoading) ? users : searchOptions;

  // Whether to show pagination (same logic as GameListedTab)
  const showPagination =
    currentPage !== undefined &&
    totalCount !== undefined &&
    pageSize !== undefined &&
    totalCount > pageSize;

  const handleCloseEditDialog = () => setUserToEdit(undefined);
  const handleCloseDeleteDialog = () => setUserToDelete(undefined);
  const handleCloseAddDialog = () => setIsAddDialogOpen(false);

  return (
    <div className="space-y-6">
      <SearchHeader
        title="用户列表"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="按名称或 QQ 搜索..."
      >
        <Button onClick={() => setIsAddDialogOpen(true)} className="mx-10">
          <Plus className="h-4 w-4 mr-2" />
          添加用户
        </Button>
        <SetDefaultPasswordButton />
      </SearchHeader>

      <div>
        {isLoading && <div className=" w-full py-1 text-center">搜索中...</div>}
        <UserListAdmin
          users={filteredUsers}
          onEdit={setUserToEdit}
          onDelete={setUserToDelete}
          onView={(user) => router.push(ALL_NAVPATH.profile.href(user.id))}
        />
      </div>

      {showPagination && (
        <PaginationWithLinks
          page={currentPage!}
          pageSize={pageSize!}
          totalCount={totalCount!}
          buildPageLink={(page) => `/admin-dashboard/users?page=${page}`}
        />
      )}

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
