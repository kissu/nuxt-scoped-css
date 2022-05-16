<template>
  <div class="identifiersContainer">
    <div class="identifiersNode text-center">Identifier</div>
    <div class="nodeContainer">
      <div style="font-size: 12px; text-align: center">
        <input
          :id="`identifierTypeURN-${ID}`"
          value="URN"
          type="radio"
          :name="`instanceIdentifier-${ID}`"
          :checked="identifierSyntax === 'URN'"
          @input="instanceIdentifiersSyntaxChange($event, 'URN')"
        />
        <label
          class="radio-inline control-label"
          :for="`identifierTypeURN-${ID}`"
          >URN</label
        >
        <input
          :id="`identifierTypeWebURI-${ID}`"
          value="WebURI"
          type="radio"
          :name="`instanceIdentifier-${ID}`"
          :checked="identifierSyntax === 'WebURI'"
          @input="instanceIdentifiersSyntaxChange($event, 'WebURI')"
        />
        <label
          class="radio-inline control-label"
          :for="`identifierTypeWebURI-${ID}`"
          >WebURI</label
        >
      </div>
      {{ sampleText }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ID: "",
      identifierSyntax: "",
      sampleText: "",
    };
  },
  mounted() {
    this.$nextTick(() => {
      const id = this.$el.parentElement.parentElement.id;
      const data = this.$df.getNodeFromId(id.slice(5));
      this.ID = data.data.ID;
      console.log("NODE ID : " + this.ID);
    });
  },
  methods: {
    instanceIdentifiersSyntaxChange(event, syntaxValue) {
      this.sampleText = syntaxValue;
      this.$df.updateConnectionNodes("node-" + this.ID);
    },
  },
};
</script>

<style>
</style>
