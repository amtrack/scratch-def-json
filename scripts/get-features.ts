#!/usr/bin/env bun
export {};

interface Feature {
  id: string;
  name: string;
  summary: string;
  description: string;
}

const response = await fetch(
  "https://developer.salesforce.com/docs/get_document_content/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm/en-us/260.0",
  {
    headers: {
      Accept: "application/json",
      "User-Agent": "curl/8.0",
    },
  },
);
const json = (await response.json()) as { content: string };
const html = json.content;

function decodeEntities(s: string) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ");
}

// Step 1: Parse the list items for id, name, summary
const listFeatures: Omit<Feature, "description">[] = [];
const listState = {
  current: null as Partial<Omit<Feature, "description">> | null,
  inAnchor: false,
};

function pushListItem() {
  const { current } = listState;
  if (current?.id && current?.name) {
    listFeatures.push({
      id: current.id,
      name: decodeEntities(current.name).trim(),
      summary: decodeEntities(current.summary ?? "").trim(),
    });
  }
}

const listRewriter = new HTMLRewriter()
  .on("li.ulchildlink", {
    element() {
      pushListItem();
      listState.current = {};
      listState.inAnchor = false;
    },
  })
  .on("li.ulchildlink a", {
    element(el) {
      const href = el.getAttribute("href") ?? "";
      const match = href.match(/#(.+)$/);
      if (match && listState.current) {
        listState.current.id = match[1];
      }
      listState.inAnchor = true;
    },
    text(text) {
      if (listState.current) {
        listState.current.name = (listState.current.name ?? "") + text.text;
      }
    },
  })
  .on("li.ulchildlink br", {
    element() {
      listState.inAnchor = false;
    },
  })
  .on("li.ulchildlink", {
    text(text) {
      if (!listState.current || listState.inAnchor) return;
      listState.current.summary = (listState.current.summary ?? "") + text.text;
    },
  });

await listRewriter.transform(new Response(html)).text();
pushListItem();

// Step 2: Parse the detail sections for descriptions
const descriptions = new Map<string, string>();
const detailState = {
  currentId: null as string | null,
  inSection: false,
  text: "",
};

const detailRewriter = new HTMLRewriter()
  .on("div.nested1[id]", {
    element(el) {
      if (detailState.currentId && detailState.text.trim()) {
        descriptions.set(detailState.currentId, decodeEntities(detailState.text).trim());
      }
      detailState.currentId = el.getAttribute("id");
      detailState.inSection = false;
      detailState.text = "";
    },
  })
  .on("div.nested1 div.section p", {
    text(text) {
      detailState.text += text.text;
    },
  });

await detailRewriter.transform(new Response(html)).text();
if (detailState.currentId && detailState.text.trim()) {
  descriptions.set(detailState.currentId, decodeEntities(detailState.text).trim());
}

// Step 3: Merge
const features: Feature[] = listFeatures.map((f) => ({
  ...f,
  description: descriptions.get(f.id) ?? "",
}));

await Bun.file("data/features.json").write(JSON.stringify(features, null, 2));
console.log(`Wrote ${features.length} features to data/features.json`);
