import { useEffect, useState } from "react";
import { MultiSelect } from "@mantine/core";

export default function TagSelect(props: any) {
  const [catOptions, setCatOptions] = useState<any>([{ value: "react" }]);

  const { tagsData } = props;

  useEffect(() => {
    setCatOptions(tagsData);
    // console.log(catOptions)
  }, [tagsData]);

  // console.log(tagsData);
  // console.log(selectedData);


  const data = [
    "React",
    "Angular",
    "Svelte",
    "Vue",
    "Riot",
    "Next.js",
    "Blitz.js"
  ];

  return catOptions ? (
    <MultiSelect
      mb="sm"
      label="Tags"
      data={catOptions}
      placeholder="Select or type categories"
      searchable
      creatable
      getCreateLabel={(query) => `+ Create ${query}`}
      onCreate={(query) => {
        const item = { value: query, label: query };
        setCatOptions((current: any) => [...current, item]);
        return item;
      }}
      maxSelectedValues={3}
    />
  ) : null;
}
