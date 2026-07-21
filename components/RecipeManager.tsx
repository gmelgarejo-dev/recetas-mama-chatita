"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeForm } from "@/components/RecipeForm";
import type { Recipe, RecipeDraft } from "@/lib/recipes";
import logoImage from "@/Images/logotipo.png";
import { initialRecipes } from "@/lib/recipes";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const getSearchText = (recipe: Recipe) =>
  normalize(
    [
      recipe.title,
      recipe.author,
      recipe.procedureHtml.replace(/<[^>]*>/g, " "),
      ...recipe.keywords,
      ...recipe.ingredients.flatMap((ingredient) => [
        ingredient.name,
        ingredient.unit,
      ]),
    ].join(" "),
  );

export function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    const search = normalize(query.trim());

    return recipes.filter((recipe) => {
      const matchesSearch = search ? getSearchText(recipe).includes(search) : true;
      const matchesStatus =
        status === "all" ||
        (status === "published" && recipe.published) ||
        (status === "draft" && !recipe.published);

      return matchesSearch && matchesStatus;
    });
  }, [query, recipes, status]);

  const stats = useMemo(
    () => ({
      total: recipes.length,
      published: recipes.filter((recipe) => recipe.published).length,
      drafts: recipes.filter((recipe) => !recipe.published).length,
    }),
    [recipes],
  );
  const editingRecipe = useMemo(
    () =>
      recipes.find((recipe) => recipe.id === editingRecipeId && !recipe.published) ??
      null,
    [editingRecipeId, recipes],
  );

  const handleCreateRecipe = (draft: RecipeDraft) => {
    setRecipes((current) => [
      {
        ...draft,
        id: `receta-${Date.now()}`,
        published: false,
      },
      ...current,
    ]);
  };

  const handleUpdateRecipe = (id: string, draft: RecipeDraft) => {
    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === id && !recipe.published
          ? {
              ...recipe,
              ...draft,
            }
          : recipe,
      ),
    );
    setEditingRecipeId(null);
  };

  const handleEditRecipe = (id: string) => {
    setEditingRecipeId(id);
    document.getElementById("nueva-receta")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePublishRecipe = (id: string) => {
    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === id ? { ...recipe, published: true } : recipe,
      ),
    );
    setEditingRecipeId((current) => (current === id ? null : current));
  };

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header className="grid gap-8 rounded-[2.5rem] border border-[#DFCCE4] bg-white/75 p-6 shadow-2xl shadow-[#DFCCE4]/40 backdrop-blur md:grid-cols-[1.55fr_0.45fr] md:p-10">
          <div className="flex flex-col justify-center">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Image
                src={logoImage}
                alt="Entre ollas y apapachos con Chatita"
                priority
                className="h-auto w-60 rounded-[1.75rem] bg-white/80 p-3 shadow-lg shadow-[#DFCCE4]/50 sm:w-80"
              />
              <div className="max-w-xl">
                <h1 className="text-2xl font-black leading-tight text-stone-950 md:text-3xl">
                  Recetas con sabor a casa, listas para compartir.
                </h1>
                <p className="mt-3 text-base leading-7 text-stone-700 md:text-lg">
                  Administra recetas familiares, guarda borradores, publica cuando
                  estén listas y encuentra cada platillo por receta, autor,
                  etiquetas o palabras clave.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#nueva-receta"
                className="rounded-full bg-[#DFCCE4] px-6 py-3 font-black text-stone-950 shadow-xl shadow-[#DFCCE4]/60 transition hover:bg-[#DFCCE4]/80"
              >
                Añadir receta
              </a>
              <a
                href="#recetario"
                className="rounded-full bg-pink-200 px-6 py-3 font-black text-stone-950 transition hover:bg-pink-100"
              >
                Ver índice
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {[
              ["Recetas", stats.total],
              ["Publicadas", stats.published],
              ["Borradores", stats.drafts],
            ].map(([label, value]) => (
              <div
                key={label}
                className="w-full max-w-40 rounded-[2rem] bg-gradient-to-br from-[#DFCCE4] to-pink-300 p-4 text-stone-950 shadow-xl shadow-[#DFCCE4]/60 md:justify-self-end"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em]">
                  {label}
                </p>
                <p className="mt-3 text-5xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <RecipeForm
            key={editingRecipe?.id ?? "new-recipe"}
            editingRecipe={editingRecipe}
            onCancelEdit={() => setEditingRecipeId(null)}
            onCreate={handleCreateRecipe}
            onUpdate={handleUpdateRecipe}
          />

          <aside
            id="recetario"
            className="rounded-[2rem] border border-[#DFCCE4] bg-white/85 p-6 shadow-xl shadow-[#DFCCE4]/40 backdrop-blur"
          >
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#7B5E83]">
                  Índice y buscador
                </p>
                <h2 className="mt-2 text-3xl font-black text-stone-950">
                  Encuentra tu receta
                </h2>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 outline-none ring-[#DFCCE4] transition focus:ring-4"
                placeholder="Buscar por receta, autor, etiqueta o palabra clave..."
              />
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "Todas"],
                  ["published", "Publicadas"],
                  ["draft", "Borradores"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value as typeof status)}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${
                      status === value
                        ? "bg-[#C1DCDC] text-stone-950"
                        : "bg-[#C1DCDC]/35 text-stone-800 hover:bg-[#C1DCDC]/60"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <nav className="mt-6 space-y-3">
              {filteredRecipes.map((recipe) => (
                <a
                  key={recipe.id}
                  href={`#recipe-${recipe.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#DFCCE4]/30 px-4 py-3 transition hover:bg-[#DFCCE4]/50"
                >
                  <span>
                    <strong className="block text-stone-900">{recipe.title}</strong>
                    <small className="text-stone-600">Por {recipe.author}</small>
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#7B5E83]">
                    {recipe.published ? "Publicada" : "Borrador"}
                  </span>
                </a>
              ))}
            </nav>

            {!filteredRecipes.length && (
              <p className="mt-6 rounded-2xl bg-pink-100 px-4 py-3 font-semibold text-pink-900">
                No hay recetas que coincidan con la búsqueda.
              </p>
            )}
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={handleEditRecipe}
              onPublish={handlePublishRecipe}
            />
          ))}
        </section>
      </section>
    </main>
  );
}
