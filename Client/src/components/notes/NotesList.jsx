import NoteCard from "./NoteCard";

const NotesList = ({
  pinnedNotes,
  unpinnedNotes,
  filteredNotes,
  getPlainTextPreview,
  exportNote,
  onArchive,
  archivingNoteId,
}) => {
  return (
    <>
      {filteredNotes.length > 0 ? (
        <>
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-xs font-medium uppercase mb-2 mt-0"
                style={{ color: "var(--txt-dim)" }}
              >
                Pinned
              </h3>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note?._id}
                    note={note}
                    getPlainTextPreview={getPlainTextPreview}
                    onExport={exportNote}
                    onArchive={onArchive}
                    isArchiving={archivingNoteId === note?._id}
                  />
                ))}
              </div>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h3
                  className="text-xs font-medium uppercase mb-2 mt-0"
                  style={{ color: "var(--txt-dim)" }}
                >
                  Others
                </h3>
              )}
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note?._id}
                    note={note}
                    getPlainTextPreview={getPlainTextPreview}
                    onExport={exportNote}
                    onArchive={onArchive}
                    isArchiving={archivingNoteId === note?._id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {filteredNotes.length === 0 && (
        <div className="text-center mt-10" style={{ color: "var(--txt-dim)" }}>
          No notes found
        </div>
      )}
    </>
  );
};

export default NotesList;
