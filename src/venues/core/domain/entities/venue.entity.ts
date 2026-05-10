export class Venue {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public gallery: VenueMedia[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Domain Rule: Validates if a given account ID is the owner of this venue.
   */
  public isOwnedBy(accountId: string): boolean {
    return this.ownerId === accountId;
  }
}

export class VenueMedia {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly providerId: string,
    public readonly order: number,
    public readonly caption?: string,
  ) {}
}
