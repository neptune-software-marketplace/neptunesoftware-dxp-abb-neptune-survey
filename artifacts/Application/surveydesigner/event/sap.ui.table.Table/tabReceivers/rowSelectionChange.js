const selectedItems = tabReceivers.getSelectedIndices();

toolReceiversSend.setEnabled(selectedItems.length > 0);
toolReceiversDelete.setEnabled(selectedItems.length > 0);
toolReceiversReset.setEnabled(selectedItems.length > 0);