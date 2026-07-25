import Modal from "./Modal.jsx";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
