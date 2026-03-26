import { CreateUserForm } from "@/components/users/create-user-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/guards";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  await requireUser("/users");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { tripMemberships: true, expensesPaid: true } },
    },
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 p-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user profiles used across trips.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="rounded border border-dashed p-4 text-sm text-muted-foreground">
              No users yet. Create one to start.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Paid Expenses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar || DEFAULT_USER_AVATAR_URL}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email ?? "-"}</TableCell>
                    <TableCell className="text-right">{user._count.tripMemberships}</TableCell>
                    <TableCell className="text-right">{user._count.expensesPaid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <CreateUserForm />
    </main>
  );
}
