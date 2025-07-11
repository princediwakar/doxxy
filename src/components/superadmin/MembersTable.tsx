import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, Mail, Edit, Trash2 } from "lucide-react";
import { MemberWithProfile } from "@/hooks/useClinicMembers";

interface MembersTableProps {
  members: MemberWithProfile[];
  isSuperadmin: boolean;
  onEditMember: (member: MemberWithProfile) => void;
  onRemoveMember: (member: MemberWithProfile) => void;
  getRoleBadgeVariant: (role: string) => "default" | "destructive" | "outline" | "secondary";
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  isSuperadmin,
  onEditMember,
  onRemoveMember,
  getRoleBadgeVariant,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Joined</TableHead>
            {isSuperadmin && <TableHead className="w-[70px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isSuperadmin ? 6 : 5} className="text-center py-8">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <User className="h-8 w-8" />
                  <p>No members found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            members.map((memberData) => (
              <TableRow key={memberData.member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {memberData.profile?.name || 'No name'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {memberData.profile?.email || 'No email'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {memberData.profile?.phone || 'No phone'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(memberData.member.role)}>
                    {memberData.member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {memberData.department?.department_types?.name || 'No Department'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {memberData.member.created_at 
                      ? new Date(memberData.member.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </TableCell>
                {isSuperadmin && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditMember(memberData)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRemoveMember(memberData)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 