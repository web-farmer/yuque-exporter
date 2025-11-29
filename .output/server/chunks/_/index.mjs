import JSZip from 'jszip';
import axios from 'axios';

const config = {
  baseURL: "https://www.yuque.com/api/v2/"
};
const request = axios.create(config);
request.interceptors.request.use((config2) => {
  const headers = config2.headers;
  config2.headers = {
    "x-auth-token": headers["x-auth-token"],
    "user-agent": headers["user-agent"]
  };
  console.log("server.url --->", config2.url);
  return config2;
});
request.interceptors.response.use(
  (res) => {
    var _a;
    if (res.status === 200) {
      return Promise.resolve(res.data);
    }
    if (res.config.responseType) {
      if ((_a = res.headers["content-type"]) == null ? void 0 : _a.includes("json")) {
        const { data } = res;
        const reader = new FileReader();
        reader.onload = () => {
          const { result } = reader;
          if (typeof result === "string") {
            res.data = JSON.parse(result);
            return Promise.reject(res);
          } else {
            return Promise.reject(res);
          }
        };
        reader.onerror = (err) => {
          res.data = err;
          return Promise.reject(res);
        };
        reader.readAsText(data);
      } else {
        return Promise.resolve(res);
      }
    } else {
      return Promise.reject(res);
    }
  },
  (e) => {
    console.log("request.e -->", e);
    return Promise.reject(e);
  }
);

const imgReg = /!\[.*?\]\((https:\/\/cdn.*?)\)/g;
const matchImg = function(target) {
  return target.match(imgReg);
};
const listTransferTree = (list, parentUuid, bookPath, link) => {
  const res = [];
  for (const item of list) {
    if (item.parent_uuid === parentUuid) {
      const children = listTransferTree(list, (item == null ? void 0 : item.uuid) || "", bookPath, `${link || ""}/${item.title}`);
      if (children.length) {
        item.items = children;
        item.collapsed = false;
      } else {
        item.link = `${bookPath}${link || ""}/${item.title}`;
        if (!parentUuid) {
          item.items = [];
        }
      }
      res.push({
        id: item.id,
        type: item.type,
        title: item.title,
        text: item.title,
        url: item.url || item.uuid,
        link: item.link,
        collapsed: item.collapsed,
        items: item.items
      });
    }
  }
  return res;
};
const getDocsBody = async (namespace, docs, headers) => {
  try {
    const requests = docs.filter((item) => item.type === "DOC" && !!item.url).map((item, index) => {
      const groupIndex = Math.floor(index / 20) + 1;
      const delay = groupIndex * 1e3;
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const res2 = await request(`/repos/${namespace}/docs/${item.url}`, {
              headers
            });
            resolve(res2);
          } catch (e) {
            reject(e);
          }
        }, delay);
      });
    });
    const res = await Promise.all(requests);
    const docMap = (res || []).reduce((sum, item) => {
      const { body, title, id, slug } = item.data;
      const doc = {
        [slug]: {
          id,
          body,
          title
        }
      };
      return {
        ...sum,
        ...doc
      };
    }, {});
    return {
      docMap
    };
  } catch (e) {
    console.log("getDocsBody.e", "e");
    throw e;
  }
};
const getDocAssets = async (zip, body, title, headers) => {
  let realBody = body;
  const images = matchImg(body);
  if (!images || !images.length) {
    return realBody;
  }
  for (const src of images || []) {
    const realImgSrc = src.replace(/((!\[.*?\])|\(|\))/g, "");
    const fileName = realImgSrc.match(/\/([\w-]+\.(?:png|jpe?g|gif|svg|webp))/i);
    if (fileName) {
      const imgData = await getImgData(realImgSrc, headers);
      const imgName = `${title}-${fileName[1]}`;
      zip.file(imgName, imgData, { base64: true });
      realBody = realBody.replace(realImgSrc, imgName);
    }
  }
  return realBody;
};
const getImgData = async function(src, apiHeaders) {
  try {
    const headers = {
      "x-auth-token": apiHeaders["x-auth-token"],
      "user-agent": apiHeaders["user-agent"]
    };
    const res = await request(src, {
      responseType: "arraybuffer",
      headers
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const base64Image = Buffer.from(res, "binary").toString("base64");
          resolve(base64Image);
        } catch (e) {
          console.log("Buffer.e", e);
          throw e;
        }
      }, 100);
    });
  } catch (e) {
    console.log("getImage.e", e);
    throw e;
  }
};
const fileZip = async (zip, items, docMap, headers) => {
  var _a;
  for (const item of items || []) {
    const { title, url, type } = item;
    if (type === "DOC" && !!url) {
      const body = (_a = docMap[url]) == null ? void 0 : _a.body;
      if (body) {
        try {
          const realBody = await getDocAssets(zip, body, title, headers);
          zip.file(`${title}.md`, `# ${title}
${realBody.replace(/<a name="\w+"><\/a>/gi, "")}`);
        } catch (e) {
          console.log("zipFile.e", e);
          throw e;
        }
      } else {
        zip.file(`${title}.md`, `# ${title}
`);
      }
    }
    if (item.items && item.items.length) {
      const folder = zip.folder(title);
      await fileZip(folder, item.items, docMap, headers);
    }
  }
};
const getDocsZip = async (list, docMap, repoName, headers) => {
  try {
    const zip = new JSZip();
    const folder = zip.folder(repoName || "docs");
    await fileZip(folder, list, docMap, headers);
    return await zip.generateNodeStream({
      type: "nodebuffer",
      // nodejs用
      streamFiles: true
    });
  } catch (e) {
    console.log("zipBook.e", e);
    throw e;
  }
};

export { getDocsZip as a, getDocsBody as g, listTransferTree as l, request as r };
//# sourceMappingURL=index.mjs.map
