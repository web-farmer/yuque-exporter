import { d as defineEventHandler, g as getHeaders, a as getQuery, s as sendStream } from '../../nitro/nitro.mjs';
import yaml from 'yaml';
import dayjs from 'dayjs';
import { g as getDocsBody, a as getDocsZip, r as request, l as listTransferTree } from '../../_/index.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jszip';
import 'axios';

const getDocList = async (namespace, headers) => {
  const { data } = await request({
    headers,
    url: `/repos/${namespace}`,
    method: "get"
  });
  const { toc_yml: toc, name, slug } = data;
  const docList = yaml.parse(toc).filter((item) => item.type !== "META");
  const docTree = listTransferTree(docList, "", "/" + slug);
  return {
    docList: docList.filter((item) => !!item.url),
    docTree,
    repoName: name
  };
};
const exportDocs = async (namespace, headers) => {
  try {
    const { docList, docTree, repoName } = await getDocList(namespace, headers);
    const { docMap } = await getDocsBody(namespace, docList, headers);
    const content = await getDocsZip(docTree || [], docMap, repoName, headers);
    return {
      content,
      repoName
    };
  } catch (e) {
    console.log("exportDocs.e", e);
    throw e;
  }
};
const _export = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    const headers = getHeaders(event);
    const { namespace } = getQuery(event);
    if (!namespace) {
      return {
        code: 500,
        message: "namespace\u4E0D\u80FD\u4E3A\u7A7A",
        time: Date.now()
      };
    } else {
      const { content, repoName } = await exportDocs(namespace, headers);
      const fileName = encodeURIComponent(`${repoName}.${dayjs().format("YYYY.MM.DD")}.zip`);
      event.node.res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return sendStream(event, content);
    }
  } catch (e) {
    return {
      code: ((_a = e == null ? void 0 : e.response) == null ? void 0 : _a.status) || (e == null ? void 0 : e.status) || (e == null ? void 0 : e.statusCode) || 500,
      data: e || e,
      message: ((_c = (_b = e == null ? void 0 : e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || ((_d = e == null ? void 0 : e.response) == null ? void 0 : _d.message) || e.message || e.statusText || "\u670D\u52A1\u5F02\u5E38\uFF0C\u8BF7\u91CD\u8BD5",
      time: Date.now()
    };
  }
});

export { _export as default };
//# sourceMappingURL=export.mjs.map
