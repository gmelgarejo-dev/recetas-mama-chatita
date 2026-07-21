"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Ingredient, Recipe, RecipeDraft } from "@/lib/recipes";
import { formatDate, parseTags } from "@/lib/recipes";

type IngredientRow = {
  quantity: string;
  unit: string;
  name: string;
};

type RecipeFormProps = {
  onCreate: (recipe: RecipeDraft) => void;
  editingRecipe?: Recipe | null;
  onCancelEdit: () => void;
  onUpdate: (id: string, recipe: RecipeDraft) => void;
};

const emptyIngredient = (): IngredientRow => ({
  quantity: "",
  unit: "",
  name: "",
});

const recipeIngredientRows = (recipe?: Recipe | null): IngredientRow[] =>
  recipe?.ingredients.map((ingredient) => ({
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    name: ingredient.name,
  })) ?? [emptyIngredient(), emptyIngredient()];

const allowedRichTextTags = new Set([
  "B",
  "BR",
  "DIV",
  "EM",
  "I",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "U",
  "UL",
]);

const sanitizeRichText = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll("*").forEach((node) => {
    if (!allowedRichTextTags.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }

    Array.from(node.attributes).forEach((attribute) => {
      node.removeAttribute(attribute.name);
    });
  });

  return doc.body.innerHTML.trim();
};

export function RecipeForm({
  onCreate,
  editingRecipe,
  onCancelEdit,
  onUpdate,
}: RecipeFormProps) {
  const today = useMemo(() => formatDate(new Date()), []);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(() => editingRecipe?.title ?? "");
  const [author, setAuthor] = useState(() => editingRecipe?.author ?? "");
  const [keywords, setKeywords] = useState(() =>
    editingRecipe?.keywords.join("; ") ?? "",
  );
  const [image, setImage] = useState<Recipe["image"]>(() => editingRecipe?.image);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    recipeIngredientRows(editingRecipe),
  );
  const [error, setError] = useState("");
  const formDate = editingRecipe?.date ?? today;

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editingRecipe?.procedureHtml ?? "";
    }
  }, [editingRecipe]);

  const updateIngredient = (
    index: number,
    field: keyof IngredientRow,
    value: string,
  ) => {
    setIngredients((current) =>
      current.map((ingredient, itemIndex) =>
        itemIndex === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((current) =>
      current.length <= 2
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImage(file ? URL.createObjectURL(file) : undefined);
  };

  const runEditorCommand = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setKeywords("");
    setImage(undefined);
    setIngredients([emptyIngredient(), emptyIngredient()]);
    setError("");

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validIngredients: Ingredient[] = ingredients
      .filter((ingredient) => ingredient.quantity && ingredient.unit && ingredient.name)
      .map((ingredient, index) => ({
        id: `ingredient-${Date.now()}-${index}`,
        quantity: ingredient.quantity.trim(),
        unit: ingredient.unit.trim(),
        name: ingredient.name.trim(),
      }));

    const editor = editorRef.current;
    const procedureText = editor?.textContent?.trim() ?? "";
    const procedureHtml = sanitizeRichText(editor?.innerHTML ?? "");

    if (!title.trim() || !author.trim() || !procedureText) {
      setError("Completa nombre de receta, autor y procedimiento.");
      return;
    }

    if (validIngredients.length < 2) {
      setError("Registra al menos 2 ingredientes completos.");
      return;
    }

    const recipeData = {
      title: title.trim(),
      author: author.trim(),
      date: formDate,
      image,
      ingredients: validIngredients,
      procedureHtml,
      keywords: parseTags(keywords),
    };

    if (editingRecipe) {
      onUpdate(editingRecipe.id, recipeData);
    } else {
      onCreate(recipeData);
    }

    resetForm();
  };

  return (
    <form
      id="nueva-receta"
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-pink-200 bg-white/90 p-6 shadow-2xl shadow-[#DFCCE4]/40 backdrop-blur"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7B5E83]">
            {editingRecipe ? "Edición de borrador" : "Nuevo registro"}
          </p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">
            {editingRecipe ? "Edita el borrador" : "Agrega una receta"}
          </h2>
        </div>
        <label className="text-sm font-semibold text-stone-600">
          Fecha
          <input
            readOnly
            value={formDate}
            className="mt-2 w-full rounded-2xl border border-[#C1DCDC] bg-[#C1DCDC]/25 px-4 py-3 text-stone-700 sm:w-56"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-stone-800">
          Nombre de la receta *
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 outline-none ring-[#DFCCE4] transition focus:ring-4"
            placeholder="Ej. Sopa de fideo de la abuela"
          />
        </label>
        <label className="text-sm font-bold text-stone-800">
          Autor *
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 outline-none ring-[#DFCCE4] transition focus:ring-4"
            placeholder="Persona que registra la receta"
          />
        </label>
        <label className="text-sm font-bold text-stone-800 md:col-span-2">
          Etiquetas de la receta separadas por punto y coma
          <input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 outline-none ring-[#DFCCE4] transition focus:ring-4"
            placeholder="caldito; familiar; rapido; postre"
          />
        </label>
        <label className="text-sm font-bold text-stone-800 md:col-span-2">
          Upload image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 w-full rounded-2xl border border-dashed border-[#C1DCDC] bg-[#C1DCDC]/25 px-4 py-3 text-stone-700"
          />
        </label>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-stone-950">Ingredientes *</h3>
          <button
            type="button"
            onClick={() => setIngredients((current) => [...current, emptyIngredient()])}
            className="rounded-full bg-[#C1DCDC] px-4 py-2 text-sm font-black text-stone-950 transition hover:bg-[#C1DCDC]/75"
          >
            Añadir ingrediente
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-3xl bg-pink-50 p-4 md:grid-cols-[1fr_1fr_2fr_auto]"
            >
              {(["quantity", "unit", "name"] as const).map((field) => (
                <input
                  key={field}
                  value={ingredient[field]}
                  onChange={(event) =>
                    updateIngredient(index, field, event.target.value)
                  }
                  className="rounded-2xl border border-pink-200 bg-white px-3 py-2 text-sm outline-none ring-[#DFCCE4] transition focus:ring-4"
                  placeholder={
                    {
                      quantity: "Cantidad",
                      unit: "Unidad",
                      name: "Ingrediente",
                    }[field]
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="rounded-2xl px-3 py-2 text-sm font-bold text-[#7B5E83] transition hover:bg-[#DFCCE4]/40 disabled:opacity-40"
                disabled={ingredients.length <= 2}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black text-stone-950">Procedimiento *</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["bold", "Negritas"],
            ["italic", "Cursiva"],
            ["underline", "Subrayar"],
            ["insertUnorderedList", "Lista"],
          ].map(([command, label]) => (
            <button
              key={command}
              type="button"
              onClick={() => runEditorCommand(command)}
              className="rounded-full bg-[#DFCCE4]/45 px-4 py-2 text-sm font-bold text-[#7B5E83] transition hover:bg-[#DFCCE4]/70"
            >
              {label}
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Describe pasos, tiempos, tips y secretos de la receta..."
          className="mt-3 min-h-40 rounded-3xl border border-pink-200 bg-white px-4 py-4 leading-7 outline-none ring-[#DFCCE4] transition focus:ring-4"
        />
      </div>

      {error && (
        <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-[#DFCCE4] px-6 py-4 text-base font-black text-stone-950 shadow-xl shadow-[#DFCCE4]/60 transition hover:bg-[#DFCCE4]/80"
      >
        {editingRecipe ? "Guardar cambios del borrador" : "Registrar como borrador"}
      </button>
      {editingRecipe && (
        <button
          type="button"
          onClick={() => {
            resetForm();
            onCancelEdit();
          }}
          className="mt-3 w-full rounded-full border border-[#DFCCE4] px-6 py-3 text-sm font-black text-[#7B5E83] transition hover:bg-[#DFCCE4]/30"
        >
          Cancelar edición
        </button>
      )}
    </form>
  );
}
