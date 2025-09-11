import './ConfirmModal.css';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="cm-modal-overlay">
      <div className="cm-modal-content">
        <p>{message}</p>
        <div className="cm-modal-actions">
          <button onClick={onConfirm} className="cm-confirm-btn">확인</button>
          <button onClick={onCancel} className="cm-cancel-btn">취소</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;