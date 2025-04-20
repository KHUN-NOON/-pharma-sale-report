import { Item } from "@/generated/prisma"

export type TopTenSaleItemsType = Array<{
    itemDetails: Item,
    totalAmount: number
}>;

export type TopTenSaleItemsChartType = Array<{
    value: number,
    name: string
}>;