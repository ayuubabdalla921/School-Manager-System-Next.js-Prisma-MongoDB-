"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AttendanceForm({
  classes,
  selectedClassId,
  onClassChange,
  date,
  onDateChange,
  statusText,
  statusVariant,
  onSubmit,
  submitting,
  inputsDisabled,
  submitDisabled,
  helperText,
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>Mark attendance for the selected class.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Class
          </label>
          <Select
            value={selectedClassId}
            onValueChange={onClassChange}
            disabled={inputsDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={inputsDisabled}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Status
          </label>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant} className="px-3 py-1 text-sm capitalize">
              {statusText}
            </Badge>
          </div>
        </div>
      </CardContent>
      {helperText ? (
        <div className="px-6 text-sm text-slate-500">{helperText}</div>
      ) : null}
      <CardFooter className="flex justify-end">
        <Button onClick={onSubmit} disabled={submitDisabled || !selectedClassId}>
          {inputsDisabled
            ? "Attendance Recorded"
            : submitting
            ? "Submitting..."
            : "Submit Attendance"}
        </Button>
      </CardFooter>
    </Card>
  );
}
