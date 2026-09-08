"use client";

import { useActionState } from "react";
import { createDocument } from "@/src/app/(vault)/documents/actions";

const initialState = {
  errors: null,
  data: null,
};

export function UploadDocumentForm() {
  const [state, formAction, isPending] = useActionState(
    createDocument,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.errors?._form?.[0] && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
        >
          {state.errors._form[0]}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label
            htmlFor="title"
            className="text-xs font-medium text-foreground/75"
          >
            Document Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={120}
            aria-invalid={Boolean(state.errors?.title)}
            aria-describedby={state.errors?.title ? "title-error" : undefined}
            placeholder="e.g. Passport, Tax Certificate"
            className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20 ${
              state.errors?.title
                ? "border-red-500 dark:border-red-500 focus:ring-red-400/30"
                : "border-black/15 dark:border-white/20"
            }`}
          />
          {state.errors?.title?.[0] && (
            <p id="title-error" className="text-xs text-red-600 dark:text-red-400">
              {state.errors.title[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="type"
            className="text-xs font-medium text-foreground/75"
          >
            Format / Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue="PDF"
            aria-invalid={Boolean(state.errors?.type)}
            aria-describedby={state.errors?.type ? "type-error" : undefined}
            className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20 ${
              state.errors?.type
                ? "border-red-500 dark:border-red-500 focus:ring-red-400/30"
                : "border-black/15 dark:border-white/20"
            }`}
          >
            <option value="PDF" className="dark:bg-neutral-900">PDF</option>
            <option value="DOCX" className="dark:bg-neutral-900">DOCX</option>
            <option value="JPG" className="dark:bg-neutral-900">JPG</option>
            <option value="PNG" className="dark:bg-neutral-900">PNG</option>
            <option value="WEBP" className="dark:bg-neutral-900">WEBP</option>
            <option value="XML" className="dark:bg-neutral-900">XML</option>
            <option value="JSON" className="dark:bg-neutral-900">JSON</option>
          </select>
          {state.errors?.type?.[0] && (
            <p id="type-error" className="text-xs text-red-600 dark:text-red-400">
              {state.errors.type[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="size"
            className="text-xs font-medium text-foreground/75"
          >
            File Size
          </label>
          <input
            id="size"
            name="size"
            type="text"
            defaultValue="1.5 MB"
            placeholder="e.g. 2.1 MB"
            aria-invalid={Boolean(state.errors?.size)}
            aria-describedby={state.errors?.size ? "size-error" : undefined}
            className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20 ${
              state.errors?.size
                ? "border-red-500 dark:border-red-500 focus:ring-red-400/30"
                : "border-black/15 dark:border-white/20"
            }`}
          />
          {state.errors?.size?.[0] && (
            <p id="size-error" className="text-xs text-red-600 dark:text-red-400">
              {state.errors.size[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="description"
          className="text-xs font-medium text-foreground/75"
        >
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Brief description of the document"
          aria-invalid={Boolean(state.errors?.description)}
          aria-describedby={
            state.errors?.description ? "description-error" : undefined
          }
          className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/20 ${
            state.errors?.description
              ? "border-red-500 dark:border-red-500 focus:ring-red-400/30"
              : "border-black/15 dark:border-white/20"
          }`}
        />
        {state.errors?.description?.[0] && (
          <p
            id="description-error"
            className="text-xs text-red-600 dark:text-red-400"
          >
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Uploading to Vault..." : "Upload to Vault"}
        </button>
      </div>
    </form>
  );
}
