import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";
import { Shift } from "@/types/userTypes";

interface ShiftSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  setShift: (shift: Shift) => void;
  onConfirm: () => void;
}

const daysAndShifts = [
  { day: "WEDNESDAY", label: "Miércoles" },
  { day: "THURSDAY", label: "Jueves" },
  { day: "FRIDAY", label: "Viernes" },
];

export default function Franjas({
  open,
  onOpenChange,
  shift,
  setShift,
  onConfirm,
}: ShiftSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selección de Franja Horaria</DialogTitle>
          <DialogDescription>
            Elige el día y la franja horaria que te fue asignada en el sistema
            de estudiantes UIS.
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-4 mt-4">
              {daysAndShifts.map(({ day, label }) => (
                <Card key={day}>
                  <CardHeader className="text-center !py-2 md:!py-4">
                    <CardTitle>{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-2">
                    <Button
                      className="text-sm"
                      variant={
                        shift?.day === day && shift.time === "AM"
                          ? "default"
                          : "secondary"
                      }
                      onClick={() =>
                        setShift({ day: day as Shift["day"], time: "AM" })
                      }
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Mañana
                    </Button>
                    <Button
                      className="text-sm"
                      variant={
                        shift?.day === day && shift.time === "PM"
                          ? "default"
                          : "secondary"
                      }
                      onClick={() =>
                        setShift({ day: day as Shift["day"], time: "PM" })
                      }
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Tarde
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
