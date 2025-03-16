import "@mantine/tiptap/styles.css";

import { useUncontrolled } from "@mantine/hooks";
import { useEditor, BubbleMenu } from "@tiptap/react";
import {
  RichTextEditor,
  Link,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Group, InputError, Paper, Stack } from "@mantine/core";
import { DisableTabIndex } from "@/components/disable_tab_index";
import { all, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { IconCodeDots } from "@tabler/icons-react";

const lowlight = createLowlight(all);

// ============================================

const ToggleCodeBlockControl = () => {
  const { editor } = useRichTextEditorContext();
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
      aria-label="Insert star emoji"
      title="Insert star emoji"
    >
      <IconCodeDots stroke={1.5} size={16} />
    </RichTextEditor.Control>
  );
};

// ============================================

type Props = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export const NoteTextEditor = (props: Props) => {
  const [_value, handleChange] = useUncontrolled({
    value: props.defaultValue,
    defaultValue: props.defaultValue,
    finalValue: "",
    onChange: props.onChange,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Placeholder.configure({
        placeholder: "Start typing your thoughts here...",
      }),
      Underline,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: _value,
    immediatelyRender: false,
    editable: !props.disabled,
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML());
    },
  });

  return (
    <>
      <Stack>
        <RichTextEditor
          editor={editor}
          styles={{
            root: {
              border: "none",
            },
            content: {
              background: "transparent",
            },
          }}
        >
          <DisableTabIndex>
            <RichTextEditor.Toolbar
              sticky
              stickyOffset={90}
              style={{
                border: "none",
                borderRadius: "var(--mantine-radius-sm)",
              }}
            >
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
          </DisableTabIndex>

          {editor && (
            <BubbleMenu editor={editor}>
              <Paper p="xs">
                <Group gap="xs">
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                    <ToggleCodeBlockControl />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>
                </Group>
              </Paper>
            </BubbleMenu>
          )}

          {props.error && <InputError mt="md">{props.error}</InputError>}

          <RichTextEditor.Content mt="md" />
        </RichTextEditor>
      </Stack>
    </>
  );
};
