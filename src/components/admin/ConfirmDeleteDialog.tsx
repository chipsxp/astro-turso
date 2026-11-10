interface Props {
  isConfirming: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  isConfirming,
  isDeleting,
  onDelete,
  onCancel,
}: Props) {
  if (isConfirming) {
    return (
      <>
        <button
          type="button"
          className="admin-media-gallery__delete admin-media-gallery__delete--confirm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          className="admin-media-gallery__delete"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      className="admin-media-gallery__delete"
      onClick={onDelete}
      disabled={isDeleting}
    >
      Delete
    </button>
  );
}
