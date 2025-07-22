import { setRootReducer } from "@/app/store/helper";

// 각 업무 도메인 Reducer를 가져와서 return 함수 setRootReducer의 argument객체에 세팅 한다.
// store 이름은 각 업무(domain)에서 actionType으로 활용 되기 때문에 기억하고 있어야 한다.
import mainStore from "@/domains/main/store";
import loginStore from "@/domains/login/store";
import menuStore from "@/domains/menu/store";
import codeStore from "@/domains/common/store";

export default function createRootReducer(): ReturnType<typeof setRootReducer> {
  return setRootReducer({
    mainStore,
    loginStore,
    menuStore,
    codeStore,
  });
}
