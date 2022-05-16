<template>
  <div>
    <div class="wrapper">
      <div class="col">
        <div
          v-for="n in listNodes"
          :key="n.ID"
          draggable="true"
          :data-node="n.item"
          class="drag-drawflow"
          @dragstart="drag($event, n.name)"
        >
          <span>{{ n.name }}</span>
        </div>
        <div style="padding-left: 29%; padding-top: 5%">
          <button class="btn btn-success" @click="buildEventRelations($event)">
            Submit
          </button>
        </div>
      </div>

      <div class="col-right">
        <div
          ref="drawflow"
          id="drawflow"
          @drop="drop($event)"
          @dragover="allowDrop($event)"
        >
          <div class="drawflowButton btn-export" @click="exportDesignInfo()">
            Export
          </div>
          <div class="drawflowButton btn-clear" @click="clearDesignInfo()">
            Clear
          </div>
          <div
            class="drawflowButton btn-importEvents"
            @click="importEventsList($event)"
          >
            Import Events
          </div>
          <div class="drawflowButton btn-import" @click="importDesignInfo()">
            Import
          </div>
          <div class="btn-lock">
            <em
              id="lock"
              class="fas fa-lock"
              onclick="editor.editor_mode='fixed'; changeMode('lock');"
            ></em>
            <em
              id="unlock"
              class="fas fa-lock-open"
              onclick="editor.editor_mode='edit'; changeMode('unlock');"
              style="display: none"
            ></em>
          </div>
          <div class="bar-zoom">
            <button
              class="btn btn-light"
              title="Zoom-in Design"
              @click="zoomDesignInfo('in')"
            >
              <em class="bi bi-zoom-in" />
            </button>
            <button
              class="btn btn-light"
              title="Reset Zoom"
              @click="zoomDesignInfo('reset')"
            >
              <em class="bi bi-search" />
            </button>
            <button
              class="btn btn-light"
              title="Zoom-out Design"
              @click="zoomDesignInfo('out')"
            >
              <em class="bi bi-zoom-out" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Identifiers from "@/components/IdentifiersNode.vue";

export default {
  name: "Drawflow",
  components: {},
  data() {
    return {
      dragEventType: "",
      nodeType: "",
      selectedNodeInfo: {},
      allEventsInfoArray: [],
      dialogVisible: false,
      nodeCount: 1,
      identifiersNodeCounter: 1,
      dialogData: {},
      listNodes: [
        {
          ID: 1,
          type: "Identifier",
          name: "Identifiers1",
          color: "#B2B6C4",
          item: "Identifiers",
          input: 1,
          output: 1,
        },
        {
          ID: 2,
          type: "Identifier",
          name: "Identifiers2",
          color: "#B2B6C4",
          item: "Identifiers",
          input: 1,
          output: 1,
        },
      ],
    };
  },
  async mounted() {
    const vm = this;
    const importedModule = await import("drawflow");
    const Drawflow = importedModule.default;
    Vue.prototype.$df = new Drawflow(this.$refs.drawflow, Vue, this);

    this.$df.reroute = false;
    this.$df.force_first_input = true;
    this.$df.start();

    this.$df.registerNode("Identifiers", Identifiers, {}, {});

    // On Node addition add the info to nodeArray
    this.$df.on("nodeCreated", function (nodeId) {
      console.log("Node Created : " + nodeId);
      if (vm.nodeType === "Identifier") {
        const identifierNodeObj = {
          identifiersId: nodeId,
          identifierSyntax: "URN",
          identifierNodeId: vm.identifiersNodeCounter,
          name: "identifiersNode" + vm.identifiersNodeCounter,
        };
        vm.identifiersNodeCounter++;

        // Add the respective created node information in nodeStore
        vm.$store.commit(
          "modules/ConfigureIdentifiersInfoStore/populateIdentifiersInfo",
          identifierNodeObj
        );
      }
    });

    // If the node is selected then get the respective node info
    this.$df.on("nodeSelected", function (nodeId) {
      const selectedNodeInfo = vm.$df.getNodeFromId(nodeId);
      vm.selectedNodeInfo.nodeType = selectedNodeInfo.html;
      vm.selectedNodeInfo.nodeId = selectedNodeInfo.data.ID;
      vm.selectedNodeInfo.eventType = selectedNodeInfo.data.eventType;
    });

    // If Node is removed then delete the Node
    this.$df.on("nodeRemoved", function (nodeID) {
      if (vm.selectedNodeInfo.nodeType === "Events") {
        // Remove the respective node information from Events Node
        vm.$store.commit(
          "modules/ConfigureNodeEventInfoStore/removeNodeEventInfo",
          vm.selectedNodeInfo.nodeId
        );
      } else if (
        vm.selectedNodeInfo.nodeType === "Identifiers" ||
        vm.selectedNodeInfo.nodeType === "ParentIdentifiers"
      ) {
        // Remove the respective node  from Identifiers Node
        vm.$store.commit(
          "modules/ConfigureIdentifiersInfoStore/removeIdentifiersInfo",
          vm.selectedNodeInfo.nodeId
        );
      }
    });
  },
  methods: {
    drag(event, eventType) {
      event.dataTransfer.setData(
        "node",
        event.target.getAttribute("data-node")
      );
      this.dragEventType = eventType;
    },

    drop(event) {
      event.preventDefault();
      const data = event.dataTransfer.getData("node");
      this.addNodeToDrawFlow(data, event.clientX, event.clientY);
    },

    allowDrop(event) {
      event.preventDefault();
    },

    addNodeToDrawFlow(name, posX, posY) {
      // Find the position of the event
      posX =
        posX *
          (this.$df.precanvas.clientWidth /
            (this.$df.precanvas.clientWidth * this.$df.zoom)) -
        this.$df.precanvas.getBoundingClientRect().x *
          (this.$df.precanvas.clientWidth /
            (this.$df.precanvas.clientWidth * this.$df.zoom));
      posY =
        posY *
          (this.$df.precanvas.clientHeight /
            (this.$df.precanvas.clientHeight * this.$df.zoom)) -
        this.$df.precanvas.getBoundingClientRect().y *
          (this.$df.precanvas.clientHeight /
            (this.$df.precanvas.clientHeight * this.$df.zoom));

      const nodeSelected = this.listNodes.find(
        (ele) => ele.name === this.dragEventType
      );
      this.nodeType = nodeSelected.type;

      const nodeCount = this.identifiersNodeCounter;

      // If type is Identifiers then add the node and increase identifierCode
      this.$df.addNode(
        name,
        nodeSelected.input,
        nodeSelected.output,
        posX,
        posY,
        nodeSelected.name,
        {
          ID: this.nodeCount,
          nodeId: nodeCount,
          eventType: this.dragEventType,
        },
        name,
        "vue"
      );

      // Increase the overall nodeCounter irrespective of EventNode or IdentifiersNode
      this.nodeCount++;
    },

    // On click of the Export button export all the drawflow information
    exportDesignInfo() {
      const drawflowInfo = this.$df.export();
      const textFileAsBlob = new Blob([JSON.stringify(drawflowInfo, null, 4)], {
        type: "text/json",
      });
      const downloadLink = document.createElement("a");
      downloadLink.download = "DrawFlow_Design.json";
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
      downloadLink.click();
    },
    // Function to clear all the design and reset the Drawflow
    clearDesign() {
      this.$df.clear();
    },
    //Zoom option for Drawflow
    zoomDesignInfo(type) {
      if (type === "out") {
        this.$df.zoom_out();
      } else if (type === "reset") {
        this.$df.zoom_reset();
      } else if (type === "in") {
        this.$df.zoom_in();
      }
    },
  },
};
</script>

<style scoped src="@/assets/css/drawflow.css">
</style>

<style scoped>
.drawflow .drawflow-node {
  background: white;
  width: 10%;
}

.drawflow-node.Identifiers1 {
  background: #D98880;
}

.drawflow-node.Identifiers2 {
  background: #C39BD3;
}

.nodeContainer {
  padding-top: 10px;
}

.node {
  border-radius: 20px;
}

.identifiersNode {
  background: #D0ECE7;
  border-radius: 25px;
  height: 25px;
  margin-top: -11px;
}
</style>