/**
 * @Author: wei
 * @Date: 2023/4/17 14:43
 * @Description: demo.js
 */

import {remark} from 'remark'
import {selectAll} from 'unist-util-select';

function replaceHTML() {
    return tree => {
        const htmlNodes = selectAll('image', tree)
        console.log(tree)
        for (const node of htmlNodes) {
            const { url } = node
            // 匹配图片名称
            const fileName = url.match(/\/([\w-]+\.(?:png|jpe?g|gif|svg|webp))/i)
            // 替换原有cdn地址为本地地址
            node.url = `${fileName[1]}`
        }
    };
}

async function main() {
    const file = await remark()
        .data('settings', { bullet: '-', listItemIndent: 'one' })
        .use([replaceHTML])
        .process('# Hi\n\n## Table of contents\n\n## Hello\n\n*Some* ~more~ _things_.\n\n- 1\n- 2\n\n![yuque](https://cdn.yuque/image.png)\n\n<a name="jpRNc"></a>')
    console.error(String(file))
}

main()
