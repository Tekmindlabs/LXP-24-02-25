import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlock from '@tiptap/extension-code-block';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Strike from '@tiptap/extension-strike';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { MathExtension } from '@aarkue/tiptap-math-extension';

import { Button } from './button';
import { Card, CardContent } from './card';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './tooltip';
import {
	Bold, Italic, Link as LinkIcon, Image as ImageIcon,
	AlignLeft, AlignCenter, AlignRight, Palette,
	Highlighter, Heading1, Heading2, Heading3, List, ListOrdered,
	Quote, Code, Strikethrough, Underline as UnderlineIcon,
	Superscript as SuperscriptIcon, Minus, Type,
	Table2, Video as VideoIcon, Calculator, X
} from 'lucide-react';
import { ColorPicker } from './color-picker';

const COLORS = {
	text: [
		{ value: '#000000', label: 'Default' },
		{ value: '#6B21A8', label: 'Purple' },
		{ value: '#DC2626', label: 'Red' },
		{ value: '#EAB308', label: 'Yellow' },
		{ value: '#2563EB', label: 'Blue' },
		{ value: '#16A34A', label: 'Green' },
		{ value: '#EA580C', label: 'Orange' },
		{ value: '#EC4899', label: 'Pink' },
		{ value: '#4B5563', label: 'Gray' }
	],
	highlight: [
		{ value: '#FFFFFF', label: 'Default' },
		{ value: '#E9D5FF', label: 'Purple' },
		{ value: '#FCA5A5', label: 'Red' },
		{ value: '#FEF08A', label: 'Yellow' },
		{ value: '#BFDBFE', label: 'Blue' },
		{ value: '#BBF7D0', label: 'Green' },
		{ value: '#FFEDD5', label: 'Orange' },
		{ value: '#FCE7F3', label: 'Pink' },
		{ value: '#F3F4F6', label: 'Gray' }
	]
};

interface ToolbarButtonProps {
	onClick: () => void;
	isActive: boolean;
	icon: React.ComponentType<{ className?: string }>;
	tooltip: string;
}




const ToolbarButton = ({ onClick, isActive, icon: Icon, tooltip }: ToolbarButtonProps) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<Button
				variant="ghost"
				size="sm"
				onClick={onClick}
				className={`${isActive ? 'bg-muted' : ''} h-8 w-8 p-0`}
			>
				<Icon className="h-4 w-4" />
			</Button>
		</TooltipTrigger>
		<TooltipContent>{tooltip}</TooltipContent>
	</Tooltip>
);

interface NovelEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function NovelEditor({
	value,
	onChange,
	placeholder = 'Start writing...',
	className = '',
}: NovelEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3]
				},
				blockquote: false,
				bulletList: false,
				codeBlock: false,
			}),
			Placeholder.configure({
				placeholder
			}),
			Image.configure({
				allowBase64: true,
				HTMLAttributes: {
					class: 'rounded-lg max-w-full',
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-primary underline decoration-primary',
				},
			}),
			TextStyle,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Color,
			Highlight.configure({
				multicolor: true,
			}),
			Blockquote,
			BulletList,
			CharacterCount,
			CodeBlock,
			FontFamily,
			FontSize,
			HorizontalRule,
			Strike,
			Superscript,
			Table.configure({
				resizable: true,
			}),
			TableCell,
			TableHeader,
			TableRow,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			Typography,
			Underline,
			Youtube.configure({
				width: 640,
				height: 480,
				HTMLAttributes: {
					class: 'w-full aspect-video',
				},
			}),
			MathExtension.configure({
				katexOptions: {
					output: 'html'
				}
			}),

		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: 'prose prose-lg focus:outline-none max-w-full min-h-[200px] px-4 py-2',
			},
		},
	});

	if (!editor) {
		return null;
	}




	return (
		<div className={`relative border rounded-lg ${className}`}>
			<TooltipProvider>
				<div className="border-b p-2 flex flex-wrap items-center gap-1 sticky top-0 bg-background z-10">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					isActive={editor.isActive('heading', { level: 1 })}
					icon={Heading1}
					tooltip="Heading 1"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					isActive={editor.isActive('heading', { level: 2 })}
					icon={Heading2}
					tooltip="Heading 2"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
					isActive={editor.isActive('heading', { level: 3 })}
					icon={Heading3}
					tooltip="Heading 3"
				/>
				<div className="w-px h-6 bg-border mx-1" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive('bold')}
					icon={Bold}
					tooltip="Bold"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive('italic')}
					icon={Italic}
					tooltip="Italic"
				/>
				<ToolbarButton
					onClick={() => {
						const url = window.prompt('Enter URL');
						if (url) editor.chain().focus().setLink({ href: url }).run();
					}}
					isActive={editor.isActive('link')}
					icon={LinkIcon}
					tooltip="Add Link"
				/>
				<div className="w-px h-6 bg-border mx-1" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					isActive={editor.isActive('bulletList')}
					icon={List}
					tooltip="Bullet List"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					isActive={editor.isActive('orderedList')}
					icon={ListOrdered}
					tooltip="Numbered List"
				/>
				<div className="w-px h-6 bg-border mx-1" />
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign('left').run()}
					isActive={editor.isActive({ textAlign: 'left' })}
					icon={AlignLeft}
					tooltip="Align Left"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign('center').run()}
					isActive={editor.isActive({ textAlign: 'center' })}
					icon={AlignCenter}
					tooltip="Align Center"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign('right').run()}
					isActive={editor.isActive({ textAlign: 'right' })}
					icon={AlignRight}
					tooltip="Align Right"
				/>
				<div className="w-px h-6 bg-border mx-1" />
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={`${editor.isActive('textStyle') ? 'bg-muted' : ''} h-8 w-8 p-0`}
						>
							<Palette className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[280px] p-3">
						<Card>
							<CardContent className="space-y-4 p-3">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="text-sm font-medium">Text Color</div>
										<Button 
											variant="ghost" 
											size="sm"
											className="h-6 w-6 p-0"
											onClick={() => editor.chain().focus().unsetColor().run()}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									<div className="space-y-3">
										<div className="grid grid-cols-5 gap-1.5">
											{COLORS.text.map(({ value, label }) => (
												<div key={value} className="text-center">
													<Button
														variant="outline"
														size="sm"
														className={`w-9 h-9 p-0 rounded-md relative mb-1 ${
															editor.isActive('textStyle', { color: value }) ? 'ring-2 ring-primary ring-offset-2' : ''
														}`}
														style={{ backgroundColor: value }}
														onClick={() => editor.chain().focus().setColor(value).run()}
														title={label}
													>
														<span className="sr-only">{label}</span>
													</Button>
													<span className="text-[10px] text-muted-foreground">{label}</span>
												</div>
											))}
										</div>
										<div className="space-y-2 pt-2 border-t">
											<div className="text-sm font-medium">Custom Color</div>
											<ColorPicker
												value={editor.getAttributes('textStyle').color || '#000000'}
												onChange={(color) => editor.chain().focus().setColor(color).run()}
											/>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={`${editor.isActive('highlight') ? 'bg-muted' : ''} h-8 w-8 p-0`}
						>
							<Highlighter className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[280px] p-3">
						<Card>
							<CardContent className="space-y-4 p-3">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="text-sm font-medium">Highlight Color</div>
										<Button 
											variant="ghost" 
											size="sm"
											className="h-6 w-6 p-0"
											onClick={() => editor.chain().focus().unsetHighlight().run()}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
									<div className="space-y-3">
										<div className="grid grid-cols-5 gap-1.5">
											{COLORS.highlight.map(({ value, label }) => (
												<div key={value} className="text-center">
													<Button
														variant="outline"
														size="sm"
														className={`w-9 h-9 p-0 rounded-md relative mb-1 ${
															editor.isActive('highlight', { color: value }) ? 'ring-2 ring-primary ring-offset-2' : ''
														}`}
														style={{ backgroundColor: value }}
														onClick={() => editor.chain().focus().setHighlight({ color: value }).run()}
														title={label}
													>
														<span className="sr-only">{label}</span>
													</Button>
													<span className="text-[10px] text-muted-foreground">{label}</span>
												</div>
											))}
										</div>
										<div className="space-y-2 pt-2 border-t">
											<div className="text-sm font-medium">Custom Color</div>
											<ColorPicker
												value={editor.getAttributes('highlight').color || '#FFEB3B'}
												onChange={(color) => editor.chain().focus().setHighlight({ color }).run()}
											/>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

					</PopoverContent>
				</Popover>
				<div className="w-px h-6 bg-border mx-1" />
				<div className="flex items-center gap-1">
					<ToolbarButton
						onClick={() => {
							const url = window.prompt('Enter image URL');
							if (url) editor.chain().focus().setImage({ src: url }).run();
						}}
						isActive={false}
						icon={ImageIcon}
						tooltip="Add Image"
					/>
					<ToolbarButton
						onClick={() => {
							const url = window.prompt('Enter YouTube URL');
							if (url) {
								const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
								if (videoId) {
									editor.chain().focus().setYoutubeVideo({
										src: videoId,
									}).run();
								}
							}

						}}
						isActive={false}
						icon={VideoIcon}
						tooltip="Add YouTube Video"
					/>
					<ToolbarButton
						onClick={() => {
							const formula = window.prompt('Enter LaTeX formula');
							if (formula) {
								editor.chain().focus().insertContent({
									type: 'math',
									attrs: { formula }
								}).run();
							}
						}}
						isActive={false}
						icon={Calculator}
						tooltip="Insert Math Formula"
					/>
				</div>
				<div className="w-px h-6 bg-border mx-1" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					isActive={editor.isActive('blockquote')}
					icon={Quote}
					tooltip="Blockquote"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					isActive={editor.isActive('codeBlock')}
					icon={Code}
					tooltip="Code Block"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					isActive={editor.isActive('strike')}
					icon={Strikethrough}
					tooltip="Strikethrough"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					isActive={editor.isActive('underline')}
					icon={UnderlineIcon}
					tooltip="Underline"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleSuperscript().run()}
					isActive={editor.isActive('superscript')}
					icon={SuperscriptIcon}
					tooltip="Superscript"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
					isActive={false}
					icon={Minus}
					tooltip="Horizontal Rule"
				/>
				<div className="w-px h-6 bg-border mx-1" />
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
						>
							<Type className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-3">
						<div className="space-y-2">
							<div className="text-sm font-medium">Font Settings</div>
							<select
								onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
								className="w-full p-1 border rounded"
							>
								<option value="Inter">Inter</option>
								<option value="Arial">Arial</option>
								<option value="Times New Roman">Times New Roman</option>
							</select>
							<select
								onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
								className="w-full p-1 border rounded"
							>
								<option value="12px">Small</option>
								<option value="16px">Normal</option>
								<option value="20px">Large</option>
							</select>
						</div>
					</PopoverContent>
				</Popover>
				<div className="w-px h-6 bg-border mx-1" />
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
						>
							<Table2 className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-3">
						<div className="space-y-2">
							<div className="text-sm font-medium">Table Controls</div>
							<div className="grid grid-cols-2 gap-2">
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
								>
									Insert Table
								</Button>
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => editor.chain().focus().addColumnAfter().run()}
								>
									Add Column
								</Button>
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => editor.chain().focus().addRowAfter().run()}
								>
									Add Row
								</Button>
								<Button 
									variant="outline" 
									size="sm"
									onClick={() => editor.chain().focus().deleteTable().run()}
								>
									Delete Table
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>



				</div>
			</TooltipProvider>

			<EditorContent editor={editor} />
		</div>
	);
}

