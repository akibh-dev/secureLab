import { publishedLabs } from "../packages/lab-content/src/index";
import { catalogSchema } from "../packages/lab-schema/src/index";

const catalog = catalogSchema.parse(publishedLabs);
console.log(`Validated ${catalog.length} published labs.`);
