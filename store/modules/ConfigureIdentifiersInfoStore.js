const getDefaultState = () => {
  return {
    identifiersArray: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  populateIdentifiersInfo(state, identifiersObj) {
    // After creation of Identifiers node add the object to IdentifiersArray
    state.identifiersArray.push(identifiersObj);
  },
  removeIdentifiersInfo(state, nodeId) {
    // If the Node is removed then remove the respective information Identifiers Array
    state.identifiersArray.splice(
      state.identifiersArray.findIndex(
        (idNode) => parseInt(idNode.identifiersId) === parseInt(nodeId)
      ),
      1
    );
  },
  identifiersSyntaxChange(state, payload) {
    // On change of the IdentifierSytax value change the respective value within the node information
    const identifiersNode = state.identifiersArray.find(
      (node) => node.identifiersId === payload.nodeId
    );
    identifiersNode.identifierSyntax = payload.syntaxValue;
  },
  // Function to populate all the Identifiers Node information into the identifiersArray during the import
  populateIdentifiersArray(state, identifiersArray) {
    state.identifiersArray = identifiersArray;
  }
};
