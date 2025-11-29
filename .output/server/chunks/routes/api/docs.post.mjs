import { d as defineEventHandler, g as getHeaders, r as readBody, s as sendStream } from '../../nitro/nitro.mjs';
import dayjs from 'dayjs';
import { g as getDocsBody, a as getDocsZip } from '../../_/index.mjs';
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

const docs_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    const headers = getHeaders(event);
    const body = await readBody(event);
    const { docList, title, namespace } = body;
    const { docMap } = await getDocsBody(namespace, docList, headers);
    const content = await getDocsZip(docList || [], docMap, title, headers);
    const fileName = encodeURIComponent(`${title}.${dayjs().format("YYYY.MM.DD")}.zip`);
    event.node.res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return sendStream(event, content);
  } catch (e) {
    event.node.res.setHeader("Content-Type", `application/json`);
    return {
      code: ((_a = e == null ? void 0 : e.response) == null ? void 0 : _a.status) || (e == null ? void 0 : e.status) || (e == null ? void 0 : e.statusCode) || 500,
      data: e || e,
      message: ((_c = (_b = e == null ? void 0 : e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || ((_d = e == null ? void 0 : e.response) == null ? void 0 : _d.message) || e.message || e.statusText || "\u670D\u52A1\u5F02\u5E38\uFF0C\u8BF7\u91CD\u8BD5",
      time: Date.now()
    };
  }
});

export { docs_post as default };
//# sourceMappingURL=docs.post.mjs.map
