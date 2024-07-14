/* eslint-disable prettier/prettier */

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const jwtConstants = {
    secret: `${process.env.JWT_SECRET}`,
};

// export const jwtConstants = {
//     secret: '2C8BAB7D3FEFEAAF417835F194CA4',
// };