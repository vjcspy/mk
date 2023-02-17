[TOC]

## Proxy Serverless

Chỉ đơn giản làm proxy. 

Đây cũng là base repo để refer khi setup serverless

Notes:

- Do ssl của `bluestone` đang nằm ở `us-east-1` nên sẽ phải deploy lên đó. Lý do để ssl ở zone này liên quan đến cloudfront. Cloudfront chỉ nhận ssl ở zone này.

### Serverless EsBuild

Do `serverless-bundle` không tương thích với pnpm và ESBuild cho hiệu suất cao hơn nên serverless sẽ base trên `ESBuild`

Refer:

- [serverless-esbuild](https://github.com/floydspace/serverless-esbuild) 



Notes:

- Support sẵn typescript nên không cần phải khai báo [serverless-plugin-typescript](https://github.com/serverless/serverless-plugin-typescript)

### Changelogs

- 1.0.0

Sử dụng `"esbuild": "^0.16.17` để fix lỗi `Invalid option in build() call: "incremental"`
