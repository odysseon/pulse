export class BusinessProfileCreatedEvent {
  constructor(
    public readonly businessProfileId: string,
    public readonly ownerId: string,
  ) {}
}

export class BusinessProfileUpdatedEvent {
  constructor(
    public readonly businessProfileId: string,
    public readonly ownerId: string,
  ) {}
}
