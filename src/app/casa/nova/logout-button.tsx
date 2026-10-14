"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// F04, passo 1: confirmação antes de sair.
export function LogoutButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Sair</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sair da sua conta neste aparelho?</DialogTitle>
          <DialogDescription>Você pode entrar de novo quando quiser.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          {/* Formulário (POST), não link: assim nenhum prefetch dispara o logout. */}
          <form action="/sair" method="post">
            <Button type="submit" className="w-full">
              Sair
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
