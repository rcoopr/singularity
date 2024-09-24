import { defineProxyService } from '@webext-core/proxy-service';

type UpdateContextMenuRepo = {
  update: () => void;
};

function updateContextMenuRepo(updateFunction: () => void): UpdateContextMenuRepo {
  return {
    update() {
      updateFunction();
    },
  };
}

export const [registerUpdateContextMenuRepo, getUpdateContextMenuRepo] = defineProxyService(
  'create-context-menu-repo',
  updateContextMenuRepo
);
