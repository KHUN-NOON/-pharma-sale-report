import { Item } from "@/generated/prisma"

export type TopTenSaleItemsType = Array<{
    itemDetails: Item,
    totalAmount: number
}>