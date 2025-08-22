"""
FM24 Moneyball Data Processor for Pyodide
Adapted from Jupyter notebook logic for browser execution
Processes FM24 HTML exports and generates Excel reports with player archetypes
"""

import pandas as pd
import numpy as np
from io import BytesIO, StringIO
import warnings
import json

warnings.filterwarnings("ignore", "This pattern is interpreted as a regular expression")

# League power ratings - hardcoded from the notebook
LEAGUE_POWER = {
    'Premier League': 95.7, 'Serie A': 88.9, 'La Liga': 88.4, 'Bundesliga': 85.6, 
    'Ligue 1': 80.8, 'Primeira Liga': 68.8, 'Eredivisie': 66.9, 'Premiership': 64.2,
    'Championship': 63.5, 'Pro League': 62.3, 'Süper Lig': 61.4, 'Liga MX': 58.9,
    'Brasileirão Assaí Série A': 58.6, 'Russian Premier League': 56.8, 'Serie B': 55.2,
    'Ekstraklasa': 54.7, 'Liga Profesional de Fútbol': 54.3, 'Liga Portugal 2': 53.8,
    'K League 1': 53.4, 'Ukrainian Premier League': 52.9, 'Liga BetPlay Dimayor': 52.4,
    'Czech First League': 51.9, 'Austrian Football Bundesliga': 51.4, 'Swiss Super League': 50.9,
    'Liga Nacional': 50.4, 'Fortuna liga': 49.9, 'First League': 49.4, 'SuperLiga': 48.9,
    'HNL': 48.4, 'Liga I': 47.9, 'Ligue Professionnelle 1 Mobilis': 47.4, 'Liga 1': 46.9,
    'Israeli Premier League': 46.4, 'Liga FPD': 45.9, 'Premier Division': 45.4,
    'Yelo League': 44.9, 'Liga 1': 44.4, 'Liga Nacional': 43.9, 'Kategoria Superiore': 43.4,
    'Premier League': 42.9, 'Premier League': 42.4, 'League of Ireland Premier Division': 41.9,
    'Veikkausliiga': 41.4, 'Allsvenskan': 40.9, 'Danish Superliga': 40.4,
    'Tippeligaen': 39.9, 'Liga Nacional': 39.4, 'Liga Primera': 38.9, 'Liga de Fútbol Profesional': 38.4,
    'Liga Nacional': 37.9, 'Premier League': 37.4, 'A-League': 36.9, 'J1 League': 36.4,
    'Chinese Super League': 35.9, 'Premier League': 35.4, 'Liga MX': 34.9, 'Premier League': 34.4,
    'Others': 5
}

# League name fixes for encoding issues (from notebook)
LEAGUE_NAME_FIXES = {
    'BrasileirÃ£o AssaÃ­ SÃ©rie A': 'Brasileirão Assaí Série A',
    'Primera FederaciÃ³n Grupo I': 'Primera Federación Grupo I',
    'Liga Profesional de FÃºtbol': 'Liga Profesional de Fútbol',
    'Primera FederaciÃ³n Grupo I': 'Primera Federación Grupo',
    'Primera FederaciÃ³n Grupo III': 'Primera Federación Grupo',
    'Primera FederaciÃ³n Grupo IV': 'Primera Federación Grupo',
    'Primera FederaciÃ³n Grupo V': 'Primera Federación Grupo',
    'Primera FederaciÃ³n Grupo VI': 'Primera Federación Grupo',
    'Primera FederaciÃ³n Grupo VII': 'Primera Federación Grupo',
    'Regionalliga SÃ¼dwest': 'Regionalliga Südwest',
    'Serie C NOW Girone A': 'Serie C NOW',
    'Serie C NOW Girone B': 'Serie C NOW',
    'Serie C NOW Girone C': 'Serie C NOW',
    'Spor Toto SÃ¼per Lig': 'Spor Toto Süper Lig',
    'French National 3 - Group A': 'French National 3',
    'French National 3 - Group B': 'French National 3',
    'French National 3 - Group C': 'French National 3',
    'French National 3 - Group D': 'French National 3',
    'French National 3 - Group E': 'French National 3',
    'French National 3 - Group F': 'French National 3',
    'French National 3 - Group G': 'French National 3',
    'French National 3 - Group H': 'French National 3',
    'French National 3 - Group I': 'French National 3',
    'French National 3 - Group J': 'French National 3',
    'French National 3 - Group K': 'French National 3',
    'French National 3 - Group L': 'French National 3',
    'BrasileirÃ£o Serie B Chevrolet': 'Brasileirão Serie B Chevrolet',
    'Serie D Girone A': 'Serie D',
    'Serie D Girone B': 'Serie D',
    'Serie D Girone C': 'Serie D',
    'Serie D Girone D': 'Serie D',
    'Serie D Girone E': 'Serie D',
    'Serie D Girone F': 'Serie D',
    'Serie D Girone G': 'Serie D',
    'Serie D Girone H': 'Serie D',
    'Serie D Girone I': 'Serie D',
    'Serie D Girone J': 'Serie D',
    'Serie D Girone K': 'Serie D',
    'Regionalliga West': 'Regionalliga',
    'Regionalliga Nord': 'Regionalliga',
    'Regionalliga Südwest': 'Regionalliga',
    'Regionalliga Bayern': 'Regionalliga',
    'Regionalliga Nordost': 'Regionalliga',
    'Russian Second Division A Gold': 'Russian Second Division A',
    'Russian Second Division A Silver': 'Russian Second Division A',  
    'Russian Second Division A Bronze': 'Russian Second Division A',    
    'Russian Second Division B - Group 1': 'Russian Second Division B',
    'Russian Second Division B - Group 2': 'Russian Second Division B',
    'Russian Second Division B - Group 3': 'Russian Second Division B',
    'DR Congo Premier Division A': 'DR Congolese Premier Division',
    'DR Congo Premier Division B': 'DR Congolese Premier Division',
}

# Text columns that should not be scaled
TEXT_COLUMNS = [
    'UID', 'Name', 'Rec', 'EU National', 'Position', 'Pros',
    'Preferred Foot', 'Inf', 'Transfer Value', 'Nat', 'Division', 
    'Club', 'Personality', 'Signability', 'Expires'
]

PERCENTAGE_COLUMNS = [
    'Sv %', 'OP-Cr %', 'Hdr %', 'Conv %', 'Pas %', 'Cr C/A', 
    'Tck R', 'Pens Saved Ratio', 'Pen/R', 'Shot %'
]

# Raw stats to convert to per 90
RAW_STATS_TO_PER90 = {
    "Yel": "Yellow/90",
    "Red": "Red/90",
    "Fls": "FoulsMade/90",
    "FA": "FoulsAgainst/90",
    "Off": "Offsides/90",
    "Gl Mst": "Gl Mst/90",
    "Goals Outside Box": "Goals Outside Box/90",
    "FK Shots": "FKShots/90"
}

def fix_league_names(df):
    """Fix encoding issues in league names in the DataFrame"""
    if 'Division' in df.columns:
        df['Division'] = df['Division'].replace(LEAGUE_NAME_FIXES)
    return df

def normalize_uid(df):
    """Normalize UID column to consistent string format"""
    df = df.copy()
    df['UID'] = pd.to_numeric(df['UID'], errors='coerce')
    df['UID'] = df['UID'].astype('Int64')
    df['UID'] = df['UID'].astype(str).str.strip()
    return df

def clean_and_convert_data(df):
    """Clean and convert data types, handle percentage columns and create composite metrics"""
    
    def convert_percentage_to_float(df, column):
        if column in df.columns:
            df[column] = (df[column].astype(str)
                          .str.replace('%', '')
                          .replace('-', np.nan)
                          .astype(float))
        return df

    # Convert minutes and filter players with at least 900 minutes
    if 'Mins' in df.columns:
        df['Mins'] = pd.to_numeric(df['Mins'], errors='coerce')
        df = df[df['Mins'] >= 900].copy()

    # Convert percentage stats
    for col in PERCENTAGE_COLUMNS:
        df = convert_percentage_to_float(df, col)

    # Handle 'Dist/90' - e.g., "7.3mi"
    if 'Dist/90' in df.columns:
        df['Dist/90'] = (
            df['Dist/90']
            .astype(str)
            .str.extract(r'([\d.]+)')[0]
        )
        df['Dist/90'] = pd.to_numeric(df['Dist/90'], errors='coerce')

    # Convert all other numerical columns (except text & signability)
    for col in df.columns:
        if col not in TEXT_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Convert raw stats to per 90 metrics
    for raw_stat, per90_stat in RAW_STATS_TO_PER90.items():
        if raw_stat in df.columns:
            df[raw_stat] = pd.to_numeric(df[raw_stat], errors='coerce')
            df['Mins'] = pd.to_numeric(df['Mins'], errors='coerce')
            df[per90_stat] = (df[raw_stat] / (df['Mins'] / 90)).fillna(0)

    # Create composite metrics before scaling
    df['Intensity'] = df["Sprints/90"] / df["Dist/90"].replace(0, 1)
    df['NetPoss'] = df["Poss Won/90"] - df["Poss Lost/90"]
    df['ChanceCreation'] = 0.20 * df['Ch C/90'] + 0.80 * df['xA/90']
    df['AerialDominance'] = (df['Hdrs W/90'] * df['Hdr %']) / 100

    # Add league strength multiplier
    def get_league_multiplier(division):
        return LEAGUE_POWER.get(division, LEAGUE_POWER['Others']) / 100.0

    df['League Multiplier'] = df['Division'].apply(get_league_multiplier)
    
    return df

def scale_numeric_data(df):
    """Scale numeric columns to 0-1 range (excluding Age and text columns)"""
    numeric_columns = [col for col in df.columns 
                      if col not in TEXT_COLUMNS 
                      and pd.api.types.is_numeric_dtype(df[col])]
    
    # Scale numeric columns (0-1) except Age
    for col in numeric_columns:
        if col == 'Age':
            continue  # Skip scaling for Age column
        if df[col].nunique() > 1:  # Only scale if there's variation
            min_val = df[col].min()
            max_val = df[col].max()
            df[col] = (df[col] - min_val) / (max_val - min_val)
        else:
            df[col] = 0.5  # Default value for constant columns
    
    return df

def get_archetype_formulas():
    """Define archetype formulas using scaled data"""
    return {
        "Sweeper Keeper": {
            "filter_regex": r"GK",
            "formula": lambda d: (
                0.80 * d["xGP/90"] +
                0.15 * d["Pas %"] +
                0.05 * (1 - d["Gl Mst/90"])
            ),
            "label": "SK Rating"
        },
        
        "Central Defender": {
            "filter_regex": r"^D\s*\(([RLC]*C[RLC]*)\)",
            "formula": lambda d: (
                0.80 * ((d["Clr/90"] + d["Int/90"] + d["Blk/90"] + 
                        d["Shts Blckd/90"] + d["AerialDominance"] + 
                        d["K Tck/90"] + d["Tck/90"]) / 7) +
                0.05 * (1 - d["Gl Mst/90"]) +
                0.15 * d["Pas %"]
            ),
            "label": "CD Rating"
        },
        
        "Fullback": {
            "filter_regex": r"^(D)\s*\((R|L|RL|RLC)\)",
            "formula": lambda d: (
                0.80 * d["xA/90"] +
                0.05 * (d["Pr passes/90"] + d["Drb/90"]) / 2 + 
                0.15 * d["Intensity"]
            ),
            "label": "FB Rating"
        },
        
        "Defensive Midfielder": {
            "filter_regex": r"DM",
            "formula": lambda d: (
                0.80 * ((d["Clr/90"] + d["Int/90"] + d["Blk/90"] + 
                        d["Shts Blckd/90"] + d["AerialDominance"] + 
                        d["K Tck/90"] + d["Tck/90"]) / 7) +
                0.15 * d["Pas %"] +
                0.05 * d["Pr passes/90"]
            ),
            "label": "DM Rating"
        },

        "Attacking Midfielder": {
            "filter_regex": r"^AM\s*\((C|RC|LC|RLC)\)",
            "formula": lambda d: (
                0.80 * (d["NP-xG/90"] + d["xA/90"]) /2 +
                0.15 * d["Pas %"] +
                0.05 * d["Drb/90"]
            ),
            "label": "AM Rating"
        },
        
        "Winger": {
            "filter_regex": r"^AM\s*\((L|R|RL|RLC)\)",
            "formula": lambda d: (
                0.80 * (d["NP-xG/90"] + d["xA/90"]) /2 +
                0.10 * d["Drb/90"] +
                0.10 * d["Pres C/90"]
            ),
            "label": "W Rating"
        },
        
        "Striker AF": {
            "filter_regex": r"ST",
            "formula": lambda d: (
                0.80 * d["NP-xG/90"] +
                0.10 * (1- d["Offsides/90"]) +
                0.10 * d["Intensity"]
            ),
            "label": "ST AF Rating"
        }
    }

def process_fm24_data(signed_html_content, loans_html_content, universal_html_content):
    """
    Main processing function that takes HTML content strings and returns Excel bytes
    
    Args:
        signed_html_content (str): HTML content for signed players
        loans_html_content (str): HTML content for loan players  
        universal_html_content (str): HTML content for universal players
        
    Returns:
        bytes: Excel file content as bytes
    """
    
    # Parse HTML content
    signed_tables = pd.read_html(StringIO(signed_html_content))
    df_signed = signed_tables[0].copy()
    df_signed = fix_league_names(df_signed)
    
    loans_tables = pd.read_html(StringIO(loans_html_content))
    df_loans = loans_tables[0].copy()
    df_loans = fix_league_names(df_loans)
    
    universal_tables = pd.read_html(StringIO(universal_html_content))
    df_universal = universal_tables[0].copy()
    df_universal = fix_league_names(df_universal)
    
    # Normalize UIDs
    df_signed = normalize_uid(df_signed)
    df_universal = normalize_uid(df_universal)
    df_loans = normalize_uid(df_loans)
    
    # Add signability flags
    df_signed['Signability'] = 'Available for Transfer'
    df_universal['Signability'] = 'Not Transferrable'
    df_loans['Signability'] = 'Available on Loan'
    
    # Concatenate and remove duplicates (signed first priority)
    df = (
        pd.concat([df_signed, df_loans, df_universal], ignore_index=True)
          .drop_duplicates(subset='UID', keep='first')
          .reset_index(drop=True)
    )
    
    # Clean and convert data
    df = clean_and_convert_data(df)
    
    # Scale numeric data
    df = scale_numeric_data(df)
    
    # Process archetypes and create Excel
    return create_excel_output(df)

def create_excel_output(df):
    """Create Excel file with archetype sheets and summary"""
    
    output_excel = BytesIO()
    
    with pd.ExcelWriter(output_excel, engine='xlsxwriter', engine_kwargs={'options': {'strings_to_urls': False}}) as writer:
        workbook = writer.book
        unicode_format = workbook.add_format({'font_name': 'Arial Unicode MS', 'valign': 'vcenter'})
        
        # Get archetype formulas
        archetype_formulas = get_archetype_formulas()
        
        # Dictionary to store archetype data for summary
        summary_data = []
        
        # Process all archetypes
        for role, config in archetype_formulas.items():
            role_df = df[df['Position'].str.contains(config["filter_regex"], regex=True, na=False)].copy()
            if role_df.empty:
                continue

            # Calculate ratings
            role_df[config["label"]] = config["formula"](role_df)
            adjusted_label = f"Adjusted {config['label']}"
            role_df[adjusted_label] = role_df[config["label"]] * role_df['League Multiplier']
            
            # Calculate percentile for each player within this archetype
            role_df['Percentile'] = role_df[adjusted_label].rank(pct=True)
            
            # Store data for summary (top 5% players)
            top_players = role_df[role_df['Percentile'] > 0.95][['UID', 'Name', 'Percentile']].copy()
            top_players['Archetype'] = role
            summary_data.append(top_players)
            
            # Write archetype sheet
            role_df['Ranking'] = role_df[adjusted_label].rank(method='min', ascending=False)
            
            output_cols = [
                'UID', 'Name', 'Age', 'Personality', 'Signability', 'EU National', 'Position', 'Preferred Foot',
                'Transfer Value', 'Nat', 'Division', 'Club',
                config["label"], adjusted_label, 'Percentile', 'Ranking', 'League Multiplier', 'Expires'
            ]
            
            result_df = role_df[output_cols].copy().sort_values(by=adjusted_label, ascending=False)
            result_df.to_excel(writer, sheet_name=role, index=False)
            
            # Format archetype sheet
            archetype_sheet = writer.sheets[role]
            for i, col in enumerate(output_cols):
                archetype_sheet.set_column(i, i, 20 if col != 'Name' else 30, unicode_format)
            
            # Format percentile as percentage
            percent_format = workbook.add_format({'num_format': '0.0%'})
            percentile_col_idx = output_cols.index('Percentile')
            archetype_sheet.set_column(percentile_col_idx, percentile_col_idx, 12, percent_format)
        
        # Create summary sheet if we have data
        if summary_data:
            all_archetypes = pd.concat(summary_data).sort_values(['UID', 'Percentile'], ascending=[True, False])
            
            # Group and format archetypes
            def format_archetypes(group):
                return ", ".join(f"{row['Archetype']} ({row['Percentile']:.1%})" for _, row in group.iterrows())
            
            player_summary = (
                all_archetypes.groupby(['UID', 'Name'])
                .apply(format_archetypes, include_groups=False)
                .reset_index(name='Top Archetypes (>95%)')
            )
            
            # Add additional info
            player_summary = player_summary.merge(
                df[['UID', 'Position', 'Age', 'Nat', 'Club', 'Division', 'Personality', 'Signability', 'Transfer Value']],
                on='UID', how='left'
            )
            
            # Final columns and sorting
            player_summary = player_summary[[
                'UID', 'Name', 'Position', 'Club', 'Division', 
                'Signability', 'Transfer Value', 'Age', 'Nat', 'Personality', 'Top Archetypes (>95%)'
            ]]
            player_summary['Archetype Count'] = player_summary['Top Archetypes (>95%)'].str.count(',') + 1
            player_summary = player_summary.sort_values(['Archetype Count', 'Name'], ascending=[False, True])
            
            # Write to summary sheet
            player_summary.to_excel(writer, sheet_name='Player Archetype Summary', index=False)
            
            # Format summary sheet
            summary_sheet = writer.sheets['Player Archetype Summary']
            for i, col in enumerate(player_summary.columns):
                width = 30 if col in ['Name', 'Top Archetypes (>95%)'] else 20
                summary_sheet.set_column(i, i, width, unicode_format)
    
    return output_excel.getvalue()

# Export main function for JavaScript/Pyodide
def main(signed_html, loans_html, universal_html):
    """Main entry point for Pyodide execution"""
    try:
        result = process_fm24_data(signed_html, loans_html, universal_html)
        return result
    except Exception as e:
        raise Exception(f"Processing failed: {str(e)}")