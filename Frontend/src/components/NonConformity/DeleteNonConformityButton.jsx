export default function DeleteNonConformityButton({ onDelete, selectedIds, userRole }) {
  const isDisabled = selectedIds.length === 0 || (userRole !== 'admin' && userRole !== 'auditor');
  return (
    <button
      onClick={onDelete}
      title={isDisabled ? 'You do not have permission to delete NonConformity' : ''}
      disabled={selectedIds.length === 0 || (userRole !== 'admin' && userRole !== 'auditor')}
      className={`bg-red-500 text-white font-bold text-xs py-2 px-5 rounded-lg mr-1 transition ${
        isDisabled ? 'bg-red-600 cursor-not-allowed' : 'hover:bg-orange-600'
      }`}>
      Delete
    </button>
  );
}
