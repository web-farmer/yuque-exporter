import { d as defineEventHandler, g as getHeaders, a as getQuery } from '../../nitro/nitro.mjs';
import yaml from 'yaml';
import { r as request, l as listTransferTree } from '../../_/index.mjs';
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

const repos = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    const headers = getHeaders(event);
    const { namespace } = getQuery(event);
    if (namespace) {
      const { data } = await request({
        headers,
        url: `/repos/${namespace}`,
        method: "get"
      });
      const { toc_yml: toc, slug } = data;
      const repoDetail = {
        ...data,
        docList: yaml.parse(toc).filter((item) => item.type !== "META"),
        docTree: listTransferTree(
          yaml.parse(toc).filter((item) => item.type !== "META"),
          "",
          "/" + slug
        )
      };
      delete repoDetail.toc_yml;
      delete repoDetail.user;
      return {
        code: 200,
        data: repoDetail,
        message: "ok",
        time: Date.now()
      };
    } else {
      const user = await request({
        headers,
        url: "/user",
        method: "get"
      });
      const { login } = user.data;
      const res = await request({
        headers,
        url: `/users/${login}/repos`,
        method: "get"
      });
      return {
        code: 200,
        data: res.data,
        message: "ok",
        time: Date.now()
      };
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

export { repos as default };
//# sourceMappingURL=repos.mjs.map
