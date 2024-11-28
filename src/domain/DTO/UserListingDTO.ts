import {ProductListingDTO} from "@domain/DTO/ProductListingDTO";

export interface UserListingDTO extends ProductListingDTO {
    user: {
        numberOfActiveLists: number;
        fullName: string;
    }
}