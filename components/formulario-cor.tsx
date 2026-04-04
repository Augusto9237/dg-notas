'use client'

import { useState } from "react"
import Color from "color"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/kibo-ui/color-picker";

interface FormularioCorProps {
  cor: string;
  label: string;
  onChange?: (novasCor: string) => void;
}

export function FormularioCor({ cor, label, onChange }: FormularioCorProps) {
  const [open, setOpen] = useState(false)
  const [corTemporaria, setCorTemporaria] = useState(cor)

  const aoConfirmarCor = () => {
    onChange?.(corTemporaria)
    setOpen(false)
  }

  const aoCancelar = () => {
    setCorTemporaria(cor)
    setOpen(false)
  }

  const aoAlterarCorColorPicker = (valor: any) => {
    try {
      // O valor viene como [r, g, b, a] array
      if (Array.isArray(valor)) {
        const novaColor = Color.rgb(valor[0], valor[1], valor[2])
        const hexColor = novaColor.hex()
        setCorTemporaria(hexColor)
      }
    } catch (erro) {
      console.error("Erro ao converter cor:", erro)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg">
          <Button
            size='icon'
            type="button"
            style={{ backgroundColor: cor }}
            className="w-10 h-10 rounded-lg"
            title={label}
          />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{cor}</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            Selecionar cor - {label}
          </DialogTitle>
        </DialogHeader>
        <ColorPicker
          className="h-full min-h-[400px]"
          defaultValue={cor}
          onChange={aoAlterarCorColorPicker}
        >
          <ColorPickerSelection />
          <div className="flex items-center gap-4">
            <ColorPickerEyeDropper />
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerFormat />
            <ColorPickerOutput />
          </div>
        </ColorPicker>
        <div className="flex gap-5 mt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={aoCancelar}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={aoConfirmarCor}
            className="flex-1"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
