import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "./command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "./popover";

interface MultiSelectProps<T extends string | number = string> {
	options: { label: string; value: T }[];
	value?: T[];
	onChange: (value: T[]) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	emptyMessage?: string;
}

export function MultiSelect<T extends string | number = string>({ 
	options, 
	value = [], // Provide default empty array
	onChange, 
	placeholder = "Select options...",
	disabled = false,
	className,
	emptyMessage = "No options available"
}: MultiSelectProps<T>) {
	const [open, setOpen] = React.useState(false);

	// Ensure options is always an array
	const safeOptions = Array.isArray(options) ? options : [];
	
	// Ensure value is always an array
	const safeValue = Array.isArray(value) ? value : [];

	const selectedLabels = safeValue
		.map(v => safeOptions.find(opt => opt.value === v)?.label)
		.filter(Boolean)
		.join(", ");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button 
					variant="outline" 
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-start", className)}
					disabled={disabled}
				>
					{selectedLabels || placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandEmpty>{emptyMessage}</CommandEmpty>
					<CommandGroup>
						{safeOptions.map((option) => (
							<CommandItem
								key={String(option.value)}
								onSelect={() => {
									const newValue = safeValue.includes(option.value)
										? safeValue.filter(v => v !== option.value)
										: [...safeValue, option.value];
									onChange(newValue);
									// Keep the popover open
									setOpen(true);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										safeValue.includes(option.value) ? "opacity-100" : "opacity-0"
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
