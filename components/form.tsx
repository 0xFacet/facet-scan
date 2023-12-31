/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/TQjd9BsBPW2
 */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function Form() {
  return (
    <div className="mx-auto space-y-6 w-full md:max-w-md">
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-input">Text</Label>
          <Input id="text-input" placeholder="Enter some text" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-input">Email</Label>
          <Input id="email-input" placeholder="name@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-input">Password</Label>
          <Input
            id="password-input"
            placeholder="Enter your password"
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-input">Date</Label>
          <Input id="date-input" type="date" />
        </div>
        <div className="space-y-2">
          <Label className="font-semibold">Select an Option</Label>
          <RadioGroup aria-labelledby="radio-group">
            <div className="flex flex-row items-center gap-2">
              <RadioGroupItem className="peer" id="option1" value="option1" />
              <Label className="text-sm font-normal" htmlFor="option1">
                Option 1
              </Label>
            </div>
            <div className="flex flex-row items-center gap-2">
              <RadioGroupItem className="peer" id="option2" value="option2" />
              <Label className="text-sm font-normal" htmlFor="option2">
                Option 2
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label className="font-semibold">Checkboxes</Label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <Checkbox className="peer" id="check1" />
              <Label className="text-sm font-normal" htmlFor="check1">
                Checkbox 1
              </Label>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Checkbox className="peer" id="check2" />
              <Label className="text-sm font-normal" htmlFor="check2">
                Checkbox 2
              </Label>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="select-input">Select</Label>
          <Select>
            <SelectTrigger className="relative w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="absolute z-10 w-full py-1 mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
              <SelectGroup>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload File</Label>
          <Input className="w-full" id="file-upload" type="file" />
        </div>
        <Button className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
}
