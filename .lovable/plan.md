

## Plan: Match Reference Website Exactly

Based on comparing your current app with the reference site (hug-me-hindi.lovable.app), I can see they are already very close. Here are the specific differences to fix:

### 1. BetPanel - Match Exact Layout
The reference shows:
- **Left side**: Bet/Auto tabs on top, then amount row with minus/plus buttons, then 4 preset buttons (100, 200, 500, 1000) in a 2x2 grid
- **Right side**: Large green "Bet (Next Round)" button showing the bet amount and "BDT" label underneath
- Your current BetPanel has the BET button but is missing the "Bet (Next Round)" text with amount and "BDT" label inside the green button

**Changes to `src/components/BetPanel.tsx`:**
- Update the green BET button to show "Bet (Next Round)" as small text on top, the bet amount in large text, and "BDT" below
- Adjust amount input to show minus button on left, amount centered, plus button on right (horizontal layout matching reference)
- Remove the ₹ symbol from presets, use comma-formatted numbers only

### 2. BetHistory - Add "My Bets" Tab Content
The reference has "All Bets", "Previous", "Top" tabs. Your current code already matches this.

- Fix the lowercase name format to use first letter + "***" + last letter pattern (already done)
- Ensure green left-border highlight on winning rows (already done)
- The bet list columns: avatar, name, amount, multiplier (purple), cashout amount

### 3. MultiplierHistory Colors
The reference shows multipliers color-coded:
- Teal/cyan for values < 2x
- Purple/magenta for values >= 2x
- This already matches your code

### 4. Game Area - Minor Refinements
- The reference shows a dark background with subtle radial rays and a red plane/curve -- already close
- Ensure the "Flew away!" text matches the reference styling

### Summary of File Changes

| File | Change |
|------|--------|
| `src/components/BetPanel.tsx` | Update green button to show "Bet (Next Round)" + amount + "BDT"; fix amount input layout with centered amount |

The main visible difference is the **BET button content** -- it should display "Bet (Next Round)", the current bet amount, and "BDT" instead of just "BET".

