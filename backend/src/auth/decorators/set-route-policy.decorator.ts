import { SetMetadata } from '@nestjs/common';
import { Roles } from 'src/common/enums/role';
import { ROUTE_POLICY_KEY } from '../constants/route.constants';

export const SetRoutePolicy = (...args: Roles[]) => {
  return SetMetadata(ROUTE_POLICY_KEY, args);
};
