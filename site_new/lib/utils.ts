import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const byteToMB = (bytes: number): string =>
  (bytes / (1024 * 1024)).toFixed(2) + " MB";

export const isFileLike = (value: any): value is File => {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    //typeof value.size === 'number' && // react-hook-form could temporarily set it to 0
    typeof value.type === "string" &&
    typeof value.lastModified === "number"
  );
};

export const isNullLike = (subItem: any) =>
  subItem === undefined || subItem === null;

const _buildFormData = (
  formData: FormData,
  obj: Record<string, any>,
  parentKey?: string
) => {

  const _buildItem = (subItem:any, key:string, formKey:string) => {
    if (isFileLike(subItem)) {
      formData.append(formKey, subItem);
      obj[key] = undefined;
    } else if (typeof subItem === "object") {
      _buildFormData(formData, subItem, formKey);
    }
  }
  for (let [key, item] of Object.entries(obj)) {
    if (isNullLike(item)) {
      continue; // skip undefined or null values
    }
    if (item instanceof FileList) {
      obj[key] = item = Array.from(item);
    }
    const formKey = parentKey ? `${parentKey}.${key}` : key; // build nested key
    if (Array.isArray(item)) {
      const flag = false;
      item.forEach((subItem) => {
        // only recursion when meet sub object, not array.
        _buildItem(subItem, key, formKey);
      });
      if (flag) obj[key] = undefined;
    } else {
      _buildItem(item, key, formKey);
    }
  }
};

// WARNING: obj should json stringable and only consist of shallow File-list for Blob part, no single File.
export const objectToFormData = (obj: Record<string, any>): FormData => {
  const formData = new FormData();
  _buildFormData(formData, obj);
  formData.append("_payload_", JSON.stringify(obj));
  return formData;
};

export const formDataToObject = (formData: FormData): Record<string, any> => {
  const payload = formData.get("_payload_");
  if (typeof payload !== "string")
    throw Error("Lack of valid payload in formdata");
  const obj: Record<string, any> = JSON.parse(payload);
  // payload is expected to be a JSON string, we only deserialize that.
  
  // all these are prepared for nested FileList structure.
  const keys = Array.from(new Set(formData.keys())).filter(
    (k) => k !== "_payload_"
  ); // Get unique keys from FormData
  // console.log(keys);
  for (const key of keys) {
    const values = formData.getAll(key);
    const path = key.split(".");

    // Start at the root of the result object
    let current = obj;
    // Iterate through the path to build the nested structure
    for (let i = 0; i < path.length - 1; i++) {
      const part = path[i];
      // If the next level in the path doesn't exist, create it as an empty object
      if (!current[part]) {
        current[part] = {};
      }
      // Move deeper into the object
      current = current[part];
    }
    // Set the value at the final destination
    current[path[path.length - 1]] = values;
  }
  return obj;
};
