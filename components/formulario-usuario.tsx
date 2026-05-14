'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, PencilIcon } from 'lucide-react'
import { FormularioInscricao } from '@/components/formulario-inscricao'
import { useRouter } from 'next/navigation'
import { User } from '@/app/generated/prisma'
import { EditButton } from './ui/edit-button'

interface FormularioUsuarioProps {
  user?: User
}

export function FormularioUsuario({ user }: FormularioUsuarioProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
    setOpen(false)
  }

  const isEditMode = !!user

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
         <EditButton/>
        ) : (
          <Button className="gap-2" variant="secondary">
            <Plus />
            <div className="max-sm:hidden flex gap-2">
              <span className="max-sm:hidden">Novo</span>
              Usuário
            </div>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEditMode ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
        </DialogHeader>
        <FormularioInscricao
          isDialog={true}
          role="admin"
          onSuccessCallback={handleSuccess}
          user={user}
        />
      </DialogContent>
    </Dialog >
  )
}
