import type { ResData, ResponseBody, RespType } from '@/types';

export const createResponse = (type: RespType, data: ResData): ResponseBody => {
  return {
    type,
    data: JSON.stringify(data),
    id: 0,
  };
};