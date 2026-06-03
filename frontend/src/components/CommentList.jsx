export function CommentList({ comments }) {
  if (!comments?.length) {
    return <p className="text-sm text-slate-500">Nenhum comentário ainda.</p>;
  }
  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li
          key={c.id}
          className={`rounded-lg border p-3 text-sm ${
            c.isInternal ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-800">{c.user?.name}</span>
            <span>{new Date(c.createdAt).toLocaleString("pt-BR")}</span>
          </div>
          {c.isInternal && <span className="mt-1 inline-block text-xs font-semibold text-amber-800">Interno</span>}
          <p className="mt-2 whitespace-pre-wrap text-slate-800">{c.message}</p>
        </li>
      ))}
    </ul>
  );
}
