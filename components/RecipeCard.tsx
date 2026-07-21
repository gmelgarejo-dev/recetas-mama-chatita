import Image from "next/image";
import type { Recipe } from "@/lib/recipes";

type RecipeCardProps = {
  recipe: Recipe;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
};

export function RecipeCard({ recipe, onEdit, onPublish }: RecipeCardProps) {
  const visibleTags = Array.from(new Set(recipe.keywords));

  return (
    <article
      id={`recipe-${recipe.id}`}
      className="overflow-hidden rounded-[2rem] border border-[#DFCCE4] bg-white/85 shadow-xl shadow-[#DFCCE4]/40 backdrop-blur"
    >
      <div className="relative h-56 bg-pink-100">
        {typeof recipe.image === "string" ? (
          <Image
            src={recipe.image}
            alt={`Foto de ${recipe.title}`}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : recipe.image ? (
          <Image
            src={recipe.image}
            alt={`Foto de ${recipe.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-200 to-[#C1DCDC] text-5xl">
            {recipe.title.charAt(0)}
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#7B5E83]">
          {recipe.published ? "Publicada" : "Borrador"}
        </span>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <p className="text-sm font-semibold text-[#7B5E83]">{recipe.date}</p>
          <h3 className="mt-1 text-2xl font-black text-stone-900">
            {recipe.title}
          </h3>
          <p className="mt-1 text-sm text-stone-600">Por {recipe.author}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#C1DCDC]/45 px-3 py-1 text-xs font-semibold text-stone-800"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div>
          <h4 className="font-bold text-stone-900">Ingredientes</h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="rounded-2xl bg-pink-50 p-3">
                <strong>
                  {ingredient.quantity} {ingredient.unit}
                </strong>{" "}
                {ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-stone-900">Procedimiento</h4>
          <div
            className="mt-2 max-w-none text-sm leading-6 text-stone-700"
            dangerouslySetInnerHTML={{ __html: recipe.procedureHtml }}
          />
        </div>

        {!recipe.published && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onEdit(recipe.id)}
              className="rounded-full border border-[#DFCCE4] px-5 py-3 text-sm font-black text-[#7B5E83] transition hover:bg-[#DFCCE4]/30"
            >
              Editar borrador
            </button>
            <button
              type="button"
              onClick={() => onPublish(recipe.id)}
              className="rounded-full bg-[#DFCCE4] px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-[#DFCCE4]/60 transition hover:bg-[#DFCCE4]/80"
            >
              Publicar receta
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
